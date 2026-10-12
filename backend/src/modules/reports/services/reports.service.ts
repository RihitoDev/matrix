import { Injectable } from '@nestjs/common';
import type { PaginatedResult } from '../../../common/types/api-response.types.js';
import { buildCsv } from '../../../common/utils/csv.js';
import { buildExportFileName } from '../../../common/utils/file-name.js';
import { paginate } from '../../../common/utils/pagination.js';
import {
  REGISTERED_USERS_CSV_HEADERS,
  REJECTED_USERS_CSV_HEADERS,
  toRegisteredUserCsvRow,
  toRejectedUserCsvRow,
  USER_TYPE_LABELS,
} from '../mappers/report-user-csv.mapper.js';
import {
  toRegisteredUserResponse,
  toRejectedUserResponse,
} from '../mappers/report-user.mapper.js';
import { ReportUsersRepository } from '../repositories/report-users.repository.js';
import type {
  RegisteredUsersFilters,
  RegisteredUsersQuery,
  RejectedUsersFilters,
  RejectedUsersQuery,
} from '../requests/report-users.schema.js';
import type {
  RegisteredUserResponse,
  RejectedUserResponse,
  ReportCsvFile,
  ReportUser,
} from '../types/report-user.types.js';
import { getAcademicPeriod } from '../utils/academic-period.js';

const REGISTERED_USERS_CSV_PREFIX = 'usuarios-registrados';
const REJECTED_USERS_CSV_PREFIX = 'usuarios-rechazados';
const CSV_EXTENSION = 'csv';
const ALL_PERIODS_FILE_NAME_SUFFIX = 'todos';

function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function containsSearch(values: string[], search?: string): boolean {
  if (!search) {
    return true;
  }

  const term = normalizeText(search);
  return values.some((value) => normalizeText(value).includes(term));
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function sortByNewest(users: ReportUser[]): ReportUser[] {
  return users.sort(
    (first, second) =>
      new Date(second.registeredAt).getTime() -
        new Date(first.registeredAt).getTime() ||
      first.id.localeCompare(second.id),
  );
}

@Injectable()
export class ReportsService {
  constructor(private readonly reportUsersRepository: ReportUsersRepository) {}

  async getRegisteredUsers(
    query: RegisteredUsersQuery,
  ): Promise<PaginatedResult<RegisteredUserResponse>> {
    const users = await this.findRegisteredUsers(query);
    return paginate(users, query.page, query.limit);
  }

  async exportRegisteredUsersCsv(
    filters: RegisteredUsersFilters,
  ): Promise<ReportCsvFile> {
    const users = await this.findRegisteredUsers(filters);
    const rows = users.map(toRegisteredUserCsvRow);

    const fileNameFilters = [
      filters.userType && USER_TYPE_LABELS[filters.userType],
      filters.search,
    ];

    return {
      fileName: buildExportFileName(
        REGISTERED_USERS_CSV_PREFIX,
        fileNameFilters,
        filters.period ?? ALL_PERIODS_FILE_NAME_SUFFIX,
        CSV_EXTENSION,
      ),
      content: buildCsv(REGISTERED_USERS_CSV_HEADERS, rows),
    };
  }

  async getRejectedUsers(
    query: RejectedUsersQuery,
  ): Promise<PaginatedResult<RejectedUserResponse>> {
    const users = await this.findRejectedUsers(query);
    return paginate(users, query.page, query.limit);
  }

  async exportRejectedUsersCsv(
    filters: RejectedUsersFilters,
  ): Promise<ReportCsvFile> {
    const users = await this.findRejectedUsers(filters);
    const rows = users.map(toRejectedUserCsvRow);

    return {
      fileName: buildExportFileName(
        REJECTED_USERS_CSV_PREFIX,
        [filters.search],
        todayIsoDate(),
        CSV_EXTENSION,
      ),
      content: buildCsv(REJECTED_USERS_CSV_HEADERS, rows),
    };
  }

  private async findRegisteredUsers(
    filters: RegisteredUsersFilters,
  ): Promise<RegisteredUserResponse[]> {
    const users = (await this.reportUsersRepository.findAll())
      .filter((user) => user.registrationStatus === 'APPROVED')
      .filter(
        (user) =>
          filters.userType === undefined || user.userType === filters.userType,
      )
      .filter(
        (user) =>
          filters.period === undefined ||
          getAcademicPeriod(user.registeredAt) === filters.period,
      )
      .filter((user) =>
        containsSearch(
          [user.fullName, user.email, user.identifier],
          filters.search,
        ),
      );

    return sortByNewest(users).map(toRegisteredUserResponse);
  }

  private async findRejectedUsers(
    filters: RejectedUsersFilters,
  ): Promise<RejectedUserResponse[]> {
    const users = (await this.reportUsersRepository.findAll())
      .filter((user) => user.registrationStatus === 'REJECTED')
      .filter((user) => containsSearch([user.email], filters.search));

    return sortByNewest(users).map(toRejectedUserResponse);
  }
}
