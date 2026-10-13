import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { toGeneratedReport } from '../mappers/generated-report.mapper.js';
import {
  REPORT_TYPES,
  type GeneratedReport,
  type GeneratedReportsPage,
  type RegisterGeneratedReportInput,
  type ReportType,
} from '../types/generated-report.types.js';

@Injectable()
export class GeneratedReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPage(
    skip: number,
    take: number,
    reportType?: ReportType,
  ): Promise<GeneratedReportsPage> {
    const where = { reportType: reportType ?? { in: [...REPORT_TYPES] } };
    const [records, total] = await Promise.all([
      this.prisma.adminExportHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.adminExportHistory.count({ where }),
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
