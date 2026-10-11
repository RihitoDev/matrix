import type { AdminExportHistory } from '../../../prisma/client.js';
import type {
  GeneratedReport,
  ReportType,
} from '../types/generated-report.types.js';

export function toGeneratedReport(record: AdminExportHistory): GeneratedReport {
  return {
    id: `${record.userId}_${record.createdAt.getTime()}`,
    fileName: record.reportName,
    reportType: record.reportType as ReportType,
    generatedAt: record.createdAt.toISOString(),
  };
}
