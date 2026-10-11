import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { isRecordNotFoundError } from '../../../common/utils/map-record-not-found.js';
import type { WorkExperiencePeriodSnapshot } from '../types/work-experience-period-snapshot.type.js';
import type { WorkExperienceRecord } from '../types/work-experience-record.type.js';
import type { WorkExperienceWriteData } from '../types/work-experience-write-data.type.js';

const workExperienceSelect = {
  id: true,
  userId: true,
  position: true,
  startDate: true,
  endDate: true,
  isCurrent: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  company: { select: { id: true, title: true } },
} as const;

@Injectable()
export class WorkExperienceRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyByUserId(userId: string): Promise<WorkExperienceRecord[]> {
    return this.prisma.workExperience.findMany({
      where: { userId },
      orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }, { id: 'desc' }],
      select: workExperienceSelect,
    });
  }

  findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<WorkExperienceRecord | null> {
    return this.prisma.workExperience.findFirst({
      where: { id, userId },
      select: workExperienceSelect,
    });
  }

  create(
    userId: string,
    data: WorkExperienceWriteData,
  ): Promise<WorkExperienceRecord> {
    const { companyName, ...fields } = data;
    return this.prisma.workExperience.create({
      data: {
        ...fields,
        user: { connect: { id: userId } },
        company: this.connectOrCreateCompany(companyName),
      },
      select: workExperienceSelect,
    });
  }

  async update(
    id: string,
    userId: string,
    data: Partial<WorkExperienceWriteData>,
    expectedPeriod: WorkExperiencePeriodSnapshot,
  ): Promise<WorkExperienceRecord | null> {
    const { companyName, ...fields } = data;
    try {
      return await this.prisma.workExperience.update({
        where: {
          id,
          userId,
          startDate: expectedPeriod.startDate,
          endDate: expectedPeriod.endDate,
          isCurrent: expectedPeriod.isCurrent,
        },
        data: {
          ...fields,
          ...(companyName === undefined
            ? {}
            : { company: this.connectOrCreateCompany(companyName) }),
        },
        select: workExperienceSelect,
      });
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.prisma.workExperience.deleteMany({
      where: { id, userId },
    });
    return result.count > 0;
  }

  private connectOrCreateCompany(companyName: string) {
    return {
      connectOrCreate: {
        where: { title: companyName },
        create: { title: companyName },
      },
    };
  }
}