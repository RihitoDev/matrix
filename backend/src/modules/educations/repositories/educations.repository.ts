import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../prisma/client.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { EDUCATION_TRANSACTION_ATTEMPTS } from '../constants/education-conflict.constants.js';
import { DuplicateEducationException } from '../exceptions/duplicate-education.exception.js';
import { EducationWriteConflictException } from '../exceptions/education-write-conflict.exception.js';
import { normalizeEducationText } from '../utils/normalize-education-text.js';
import { resolveEducationInstitution } from '../utils/resolve-education-institution.js';
import { resolveEducationDegree } from '../utils/resolve-education-degree.js';
import { validateEducationDegree } from '../utils/validate-education-degree.js';
import { EDUCATION_SELECT } from '../constants/education-select.constants.js';
import type { CreateEducationRequest } from '../requests/create-education.request.js';
import type { UpdateEducationRequest } from '../requests/update-education.request.js';
import type { EducationRecord } from '../types/education-record.type.js';
import type { EducationPeriodSnapshot } from '../types/education-period-snapshot.type.js';

@Injectable()
export class EducationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyByUserId(userId: string): Promise<EducationRecord[]> {
    return this.prisma.education.findMany({
      where: { userId },
      orderBy: [{ startDate: 'desc' }, { id: 'desc' }],
      select: EDUCATION_SELECT,
    });
  }

  findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<EducationRecord | null> {
    return this.prisma.education.findFirst({
      where: { id, userId },
      select: EDUCATION_SELECT,
    });
  }

  create(
    userId: string,
    data: CreateEducationRequest,
  ): Promise<EducationRecord> {
    return this.withSerializableWrite(async (tx) => {
      await this.assertNoDuplicate(tx, userId, data);
      return tx.education.create({
        data: { ...data, userId },
        select: EDUCATION_SELECT,
      });
    });
  }

  async update(
    id: string,
    userId: string,
    data: UpdateEducationRequest,
    expectedPeriod: EducationPeriodSnapshot,
  ): Promise<EducationRecord | null> {
    return this.withSerializableWrite(async (tx) => {
      const where = { id, userId, ...expectedPeriod };
      const current = await tx.education.findFirst({ where, select: EDUCATION_SELECT });
      if (!current) return null;
      validateEducationDegree(data.institution ?? current.institution, data.degree ?? current.degree);
      await this.assertNoDuplicate(tx, userId, { ...current, ...data }, id);
      const records = await tx.education.updateManyAndReturn({
        where, data, select: EDUCATION_SELECT,
      });
      return records[0] ?? null;
    });
  }

  private async assertNoDuplicate(
    tx: Prisma.TransactionClient,
    userId: string,
    candidate: Pick<EducationRecord, 'institution' | 'degree' | 'startDate' | 'endDate'>,
    excludedId?: string,
  ): Promise<void> {
    const records = await tx.education.findMany({
      where: {
        userId, startDate: candidate.startDate, endDate: candidate.endDate,
        ...(excludedId ? { id: { not: excludedId } } : {}),
      },
      select: { institution: true, degree: true },
    });
    const institution = normalizeEducationText(resolveEducationInstitution(candidate.institution) ?? candidate.institution);
    if (records.some((record) => normalizeEducationText(resolveEducationInstitution(record.institution) ?? record.institution) === institution
      && normalizeEducationText(resolveEducationDegree(record.institution, record.degree) ?? record.degree)
        === normalizeEducationText(resolveEducationDegree(candidate.institution, candidate.degree) ?? candidate.degree))) {
      throw new DuplicateEducationException();
    }
  }

  private async withSerializableWrite<T>(operation: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    for (let attempt = 0; attempt < EDUCATION_TRANSACTION_ATTEMPTS; attempt += 1) {
      try {
        return await this.prisma.$transaction(operation, { isolationLevel: 'Serializable' });
      } catch (error: unknown) {
        if (typeof error !== 'object' || error === null || !('code' in error)
          || error.code !== 'P2034') throw error;
      }
    }
    throw new EducationWriteConflictException();
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.prisma.education.deleteMany({
      where: { id, userId },
    });
    return result.count > 0;
  }
}
