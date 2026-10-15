import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { Prisma } from '../../../prisma/client.js';
import {
  AccessRequestCatalogMissingException,
  AccessRequestNotFoundException,
  ActiveAccessRequestExistsException,
  RequestCodeGenerationException,
} from '../exceptions/index.js';
import type { CreateAccessRequestDto } from '../requests/create-access-request.schema.js';
import type { UpdateAccessRequestDto } from '../requests/update-access-request.schema.js';
import { nextRequestCode, randomRetryDelayMs, requestCodePrefix, sleep } from '../helpers/request-code.js';
import { MAX_REQUEST_CODE_ATTEMPTS } from '../constants/request-code.constants.js';
import { isSubmittedDuplicate } from '../helpers/unique-violation.js';
import { ACCESS_REQUEST_STATUS } from '../types/access-request.enum.js';
import { ACCESS_REQUEST_SELECT } from '../constants/access-request-selects.constants.js';
import { ACTIVE_STATUSES, LISTED_STATUSES } from '../constants/access-request-status-groups.constants.js';
import { MAX_SEARCH_TERMS } from '../constants/inbox-filters.constants.js';
import { DECIDED_STATUSES } from '../constants/inbox-summary.constants.js';
import { escapeLikePattern } from '../helpers/escape-like-pattern.js';
import { foldAccents } from '../helpers/fold-accents.js';
import { ACCENT_FOLD_FROM, ACCENT_FOLD_TO } from '../constants/accent-folding.constants.js';

@Injectable()
export class AccessRequestsRepository {
  retryPause: (ms: number) => Promise<void> = sleep;

  constructor(private readonly prisma: PrismaService) {}

  async createDraft(data: CreateAccessRequestDto) {
    const { career, ...rest } = data;
    try {
      return await this.prisma.accessRequest.create({
        data: {
          ...rest,
          status: { connect: { title: ACCESS_REQUEST_STATUS.DRAFT } },
          career: { connect: { title: career } },
        },
        select: ACCESS_REQUEST_SELECT,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AccessRequestCatalogMissingException();
      }
      throw error;
    }
  }

  private async findIdsBySearch(terms: string[]): Promise<string[]> {
    const folded = (column: Prisma.Sql) => Prisma.sql`lower(translate(${column}, ${ACCENT_FOLD_FROM}, ${ACCENT_FOLD_TO}))`;
    const conditions = terms.map((term) => {
      const pattern = `%${escapeLikePattern(foldAccents(term))}%`;
      return Prisma.sql`(${folded(Prisma.sql`first_name`)} LIKE ${pattern} ESCAPE '\\'
        OR ${folded(Prisma.sql`last_name`)} LIKE ${pattern} ESCAPE '\\'
        OR lower(id_card_number) LIKE ${pattern} ESCAPE '\\'
        OR lower(sis_code) LIKE ${pattern} ESCAPE '\\')`;
    });
    const rows = await this.prisma.$queryRaw<{ id: string }[]>(
      Prisma.sql`SELECT id FROM access_requests WHERE ${Prisma.join(conditions, ' AND ')}`,
    );
    return rows.map((row) => row.id);
  }

  async findPage(params: { status?: string; search?: string; career?: string; submittedFrom?: Date; page: number; limit: number }) {
    const terms = params.search?.split(/\s+/).filter(Boolean).slice(0, MAX_SEARCH_TERMS) ?? [];
    const matchingIds = terms.length > 0 ? await this.findIdsBySearch(terms) : undefined;
    const where: Prisma.AccessRequestWhereInput = {
      status: { title: params.status ?? { in: LISTED_STATUSES } },
      ...(params.career && { career: { title: params.career } }),
      ...(params.submittedFrom && { submittedAt: { gte: params.submittedFrom } }),
      ...(matchingIds && { id: { in: matchingIds } }),
    };
    const [rows, total] = await Promise.all([
      this.prisma.accessRequest.findMany({
        where,
        orderBy: [{ submittedAt: 'desc' }, { id: 'asc' }],
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        select: {
          id: true,
          requestCode: true,
          firstName: true,
          lastName: true,
          email: true,
          sisCode: true,
          submittedAt: true,
          status: { select: { title: true } },
          career: { select: { title: true } },
          documentType: { select: { title: true } },
        } satisfies Prisma.AccessRequestSelect,
      }),
      this.prisma.accessRequest.count({ where }),
    ]);
    return { rows, total };
  }

  countByStatus(status: string, filters: { submittedBefore?: Date; reviewedFrom?: Date } = {}) {
    return this.prisma.accessRequest.count({
      where: {
        status: { title: status },
        ...(filters.submittedBefore && { submittedAt: { lt: filters.submittedBefore } }),
        ...(filters.reviewedFrom && { reviewedAt: { gte: filters.reviewedFrom } }),
      },
    });
  }

  findReviewTimes(since: Date) {
    return this.prisma.accessRequest.findMany({
      where: { status: { title: { in: DECIDED_STATUSES } }, reviewedAt: { gte: since }, submittedAt: { not: null } },
      select: { submittedAt: true, reviewedAt: true },
    });
  }

  findDetailById(id: string) {
    return this.prisma.accessRequest.findUnique({
      where: { id },
      select: {
        id: true,
        requestCode: true,
        firstName: true,
        lastName: true,
        idCardNumber: true,
        idCardIssuedIn: true,
        sisCode: true,
        email: true,
        phone: true,
        birthDate: true,
        graduationYear: true,
        documentFileId: true,
        submittedAt: true,
        reviewedAt: true,
        rejectionReason: true,
        status: { select: { title: true } },
        career: { select: { title: true } },
        documentType: { select: { title: true } },
        documentFile: { select: { name: true, extension: true, mimeType: true, size: true } },
        reviewedBy: { select: { firstName: true, lastName: true } },
      } satisfies Prisma.AccessRequestSelect,
    });
  }

  async markInReview(id: string, reviewerId: string): Promise<boolean> {
    try {
      await this.prisma.accessRequest.update({
        where: { id, status: { title: ACCESS_REQUEST_STATUS.PENDING } },
        data: {
          status: { connect: { title: ACCESS_REQUEST_STATUS.IN_REVIEW } },
          reviewedBy: { connect: { id: reviewerId } },
          reviewedAt: new Date(),
        },
        select: { id: true },
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }

  async setVerdict(id: string, reviewerId: string, verdict: { status: string; rejectionReason?: string }): Promise<boolean> {
    try {
      await this.prisma.accessRequest.update({
        where: { id, status: { title: ACCESS_REQUEST_STATUS.IN_REVIEW } },
        data: {
          status: { connect: { title: verdict.status } },
          reviewedBy: { connect: { id: reviewerId } },
          reviewedAt: new Date(),
          ...(verdict.rejectionReason !== undefined && { rejectionReason: verdict.rejectionReason }),
        },
        select: { id: true },
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }

  findById(id: string) {
    return this.prisma.accessRequest.findUnique({ where: { id }, select: ACCESS_REQUEST_SELECT });
  }

  findActiveDuplicates(fields: { email?: string; idCardNumber?: string; sisCode?: string; excludeId?: string }) {
    const { email, idCardNumber, sisCode, excludeId } = fields;
    const matches: Prisma.AccessRequestWhereInput[] = [];
    if (email !== undefined) matches.push({ email: { equals: email, mode: 'insensitive' } });
    if (idCardNumber !== undefined) matches.push({ idCardNumber });
    if (sisCode !== undefined) matches.push({ sisCode });

    return this.prisma.accessRequest.findMany({
      where: {
        OR: matches,
        status: { title: { in: ACTIVE_STATUSES } },
        ...(excludeId !== undefined && { id: { not: excludeId } }),
      },
      select: { email: true, idCardNumber: true, sisCode: true },
    });
  }

  async updateDraft(id: string, data: UpdateAccessRequestDto) {
    const { career, ...rest } = data;
    try {
      return await this.prisma.accessRequest.update({
        where: { id, status: { title: ACCESS_REQUEST_STATUS.DRAFT } },
        data: { ...rest, ...(career !== undefined && { career: { connect: { title: career } } }) },
        select: ACCESS_REQUEST_SELECT,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        if (typeof error.meta?.model === 'string') {
          throw new AccessRequestCatalogMissingException();
        }
        throw new AccessRequestNotFoundException();
      }
      throw error;
    }
  }

  setDocument(id: string, fileId: string, documentType: string) {
    return this.replaceDocument(id, {
      documentFile: { connect: { id: fileId } },
      documentType: { connect: { title: documentType } },
    });
  }

  clearDocument(id: string) {
    return this.replaceDocument(id, { documentFile: { disconnect: true }, documentType: { disconnect: true } });
  }

  private async replaceDocument(id: string, data: Prisma.AccessRequestUpdateInput) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const previous = await tx.accessRequest.findFirst({
          where: { id, status: { title: ACCESS_REQUEST_STATUS.DRAFT } },
          select: { documentFileId: true },
        });
        await tx.accessRequest.update({
          where: { id, status: { title: ACCESS_REQUEST_STATUS.DRAFT } },
          data,
          select: { id: true },
        });
        return previous?.documentFileId ?? null;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        if (typeof error.meta?.model === 'string') {
          throw new AccessRequestCatalogMissingException();
        }
        throw new AccessRequestNotFoundException();
      }
      throw error;
    }
  }

  async generateRequestCode(now: Date = new Date()) {
    const year = now.getUTCFullYear();
    const last = await this.prisma.accessRequest.findFirst({
      where: { requestCode: { startsWith: requestCodePrefix(year) } },
      orderBy: { requestCode: 'desc' },
      select: { requestCode: true },
    });
    return nextRequestCode(year, last?.requestCode);
  }

  async submit(id: string, requestCode: string) {
    try {
      return await this.prisma.accessRequest.update({
        where: { id, status: { title: ACCESS_REQUEST_STATUS.DRAFT } },
        data: {
          requestCode,
          submittedAt: new Date(),
          status: { connect: { title: ACCESS_REQUEST_STATUS.PENDING } },
        },
        select: { id: true, requestCode: true, submittedAt: true, status: { select: { title: true } } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        if (typeof error.meta?.model === 'string') {
          throw new AccessRequestCatalogMissingException();
        }
        throw new AccessRequestNotFoundException();
      }
      throw error;
    }
  }

  async submitWithGeneratedCode(id: string) {
    for (let attempt = 1; attempt <= MAX_REQUEST_CODE_ATTEMPTS; attempt++) {
      const requestCode = await this.generateRequestCode();
      try {
        return await this.submit(id, requestCode);
      } catch (error) {
        const isCollision = error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
        if (!isCollision) throw error;
        if (isSubmittedDuplicate(error.meta)) throw new ActiveAccessRequestExistsException();
      }
      if (attempt < MAX_REQUEST_CODE_ATTEMPTS) await this.retryPause(randomRetryDelayMs());
    }
    throw new RequestCodeGenerationException();
  }

  findByRequestCode(requestCode: string, email: string) {
    return this.prisma.accessRequest.findFirst({
      where: { requestCode, email: { equals: email, mode: 'insensitive' } },
      select: {
        requestCode: true,
        submittedAt: true,
        reviewedAt: true,
        rejectionReason: true,
        status: { select: { title: true } },
        documentType: { select: { title: true } },
        documentFile: { select: { size: true, mimeType: true } },
      } satisfies Prisma.AccessRequestSelect,
    });
  }

  async deleteDraft(id: string) {
    try {
      await this.prisma.accessRequest.delete({ where: { id, status: { title: ACCESS_REQUEST_STATUS.DRAFT } } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AccessRequestNotFoundException();
      }
      throw error;
    }
  }
}
