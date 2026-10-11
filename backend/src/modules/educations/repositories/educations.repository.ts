import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
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
    return this.prisma.education.create({
      data: { ...data, userId },
      select: EDUCATION_SELECT,
    });
  }

  async update(
    id: string,
    userId: string,
    data: UpdateEducationRequest,
    expectedPeriod: EducationPeriodSnapshot,
  ): Promise<EducationRecord | null> {
    // Match the dates used by the service validation in the same atomic write.
    const records = await this.prisma.education.updateManyAndReturn({
      where: {
        id,
        userId,
        startDate: expectedPeriod.startDate,
        endDate: expectedPeriod.endDate,
      },
      data,
      select: EDUCATION_SELECT,
    });
    return records[0] ?? null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.prisma.education.deleteMany({
      where: { id, userId },
    });
    return result.count > 0;
  }
}
