import { Injectable } from '@nestjs/common';
import type { PaginatedResult } from '../../../common/types/api-response.types.js';
import { buildCsv } from '../../../common/utils/csv.js';
import { paginate } from '../../../common/utils/pagination.js';
import {
  REGISTERED_USERS_CSV_HEADERS,
  REJECTED_USERS_CSV_HEADERS,
  toRegisteredUserCsvRow,
  toRejectedUserCsvRow,
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

const REGISTERED_USERS_CSV_PREFIX = 'usuarios-registrados';
const REJECTED_USERS_CSV_PREFIX = 'usuarios-rechazados';

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
      new Date(first.registeredAt).getTime(),
  );
}

@Injectable()
export class ReportsService {
  constructor(private readonly reportUsersRepository: ReportUsersRepository) {}

  getRegisteredUsers(
    query: RegisteredUsersQuery,
  ): PaginatedResult<RegisteredUserResponse> {
    return paginate(this.findRegisteredUsers(query), query.page, query.limit);
  }

  exportRegisteredUsersCsv(filters: RegisteredUsersFilters): ReportCsvFile {
    const rows = this.findRegisteredUsers(filters).map(toRegisteredUserCsvRow);

    return {
      fileName: `${REGISTERED_USERS_CSV_PREFIX}-${todayIsoDate()}.csv`,
      content: buildCsv(REGISTERED_USERS_CSV_HEADERS, rows),
    };
  }

  getRejectedUsers(
    query: RejectedUsersQuery,
  ): PaginatedResult<RejectedUserResponse> {
    return paginate(this.findRejectedUsers(query), query.page, query.limit);
  }

  exportRejectedUsersCsv(filters: RejectedUsersFilters): ReportCsvFile {
    const rows = this.findRejectedUsers(filters).map(toRejectedUserCsvRow);

    return {
      fileName: `${REJECTED_USERS_CSV_PREFIX}-${todayIsoDate()}.csv`,
      content: buildCsv(REJECTED_USERS_CSV_HEADERS, rows),
    };
  }

  private findRegisteredUsers(
    filters: RegisteredUsersFilters,
  ): RegisteredUserResponse[] {
    const users = this.reportUsersRepository
      .findAll()
      .filter((user) => user.registrationStatus === 'APPROVED')
      .filter(
        (user) =>
          filters.userType === undefined || user.userType === filters.userType,
      )
      .filter(
        (user) =>
          filters.year === undefined ||
          new Date(user.registeredAt).getUTCFullYear() === filters.year,
      )
      .filter((user) =>
        containsSearch(
          [user.fullName, user.email, user.identifier],
          filters.search,
        ),
      );

    return sortByNewest(users).map(toRegisteredUserResponse);
  }

  private findRejectedUsers(
    filters: RejectedUsersFilters,
  ): RejectedUserResponse[] {
    const users = this.reportUsersRepository
      .findAll()
      .filter((user) => user.registrationStatus === 'REJECTED')
      .filter((user) => containsSearch([user.email], filters.search));

    return sortByNewest(users).map(toRejectedUserResponse);
  }
}
