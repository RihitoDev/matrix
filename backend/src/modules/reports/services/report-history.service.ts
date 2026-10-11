import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { PaginatedResult } from '../../../common/types/api-response.types.js';
import { paginate } from '../../../common/utils/pagination.js';
import { GeneratedReportsRepository } from '../repositories/generated-reports.repository.js';
import type { ReportHistoryQuery } from '../requests/report-history.schema.js';
import type {
  GeneratedReport,
  RegisterGeneratedReportInput,
} from '../types/generated-report.types.js';

function sortByNewest(reports: readonly GeneratedReport[]): GeneratedReport[] {
  return [...reports].sort(
    (first, second) =>
      new Date(second.generatedAt).getTime() -
      new Date(first.generatedAt).getTime(),
  );
}

@Injectable()
export class ReportHistoryService {
  constructor(
    private readonly generatedReportsRepository: GeneratedReportsRepository,
  ) {}

  getReportHistory(
    query: ReportHistoryQuery,
  ): PaginatedResult<GeneratedReport> {
    const reports = sortByNewest(this.generatedReportsRepository.findAll());

    return paginate(reports, query.page, query.limit);
  }

  registerGeneratedReport(
    input: RegisterGeneratedReportInput,
  ): GeneratedReport {
    return this.generatedReportsRepository.create({
      id: randomUUID(),
      fileName: input.fileName,
      reportType: input.reportType,
      generatedAt: new Date().toISOString(),
    });
  }
}
