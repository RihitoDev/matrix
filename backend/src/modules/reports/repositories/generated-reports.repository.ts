import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { toGeneratedReport } from '../mappers/generated-report.mapper.js';
import type {
  GeneratedReport,
  GeneratedReportsPage,
  RegisterGeneratedReportInput,
} from '../types/generated-report.types.js';

@Injectable()
export class GeneratedReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPage(skip: number, take: number): Promise<GeneratedReportsPage> {
    const [records, total] = await Promise.all([
      this.prisma.adminExportHistory.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.adminExportHistory.count(),
    ]);

    return { reports: records.map(toGeneratedReport), total };
  }

  async create(
    userId: string,
    input: RegisterGeneratedReportInput,
  ): Promise<GeneratedReport> {
    const record = await this.prisma.adminExportHistory.create({
      data: {
        userId,
        reportName: input.fileName,
        reportType: input.reportType,
      },
    });

    return toGeneratedReport(record);
  }
}
