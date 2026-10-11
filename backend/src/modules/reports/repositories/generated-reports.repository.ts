import { Injectable } from '@nestjs/common';
import type { GeneratedReport } from '../types/generated-report.types.js';

@Injectable()
export class GeneratedReportsRepository {
  private readonly reports: GeneratedReport[] = [];

  findAll(): readonly GeneratedReport[] {
    return this.reports;
  }

  create(report: GeneratedReport): GeneratedReport {
    this.reports.push(report);
    return report;
  }
}
