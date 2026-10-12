import { Injectable } from '@nestjs/common';
import type { PaginatedResult } from '../../../common/types/api-response.types.js';
import { GeneratedReportsRepository } from '../repositories/generated-reports.repository.js';
import type { ReportHistoryQuery } from '../requests/report-history.schema.js';
import type {
  GeneratedReport,
  RegisterGeneratedReportInput,
} from '../types/generated-report.types.js';

@Injectable()
export class ReportHistoryService {
  constructor(
    private readonly generatedReportsRepository: GeneratedReportsRepository,
  ) {}

  async getReportHistory({
    page,
    limit,
  }: ReportHistoryQuery): Promise<PaginatedResult<GeneratedReport>> {
    const { reports, total } = await this.generatedReportsRepository.findPage(
      (page - 1) * limit,
      limit,
    );

    return {
      items: reports,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    };
  }

  registerGeneratedReport(
    userId: string,
    input: RegisterGeneratedReportInput,
  ): Promise<GeneratedReport> {
    return this.generatedReportsRepository.create(userId, input);
  }
}
