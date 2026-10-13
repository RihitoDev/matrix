import type { RoleName } from '../../../common/enums/roles.enum.js';
import type { AdminExportHistory } from '../../../prisma/client.js';
import {
  REGISTERED_USERS_REPORT_TYPES,
  type GeneratedReport,
  type ReportType,
} from '../types/generated-report.types.js';

export function toGeneratedReport(record: AdminExportHistory): GeneratedReport {
  return {
    id: `${record.userId}_${record.createdAt.getTime()}`,
    fileName: record.reportName,
    reportType: record.reportType as ReportType,
    generatedAt: record.createdAt.toISOString(),
  };
}

export function toRegisteredUsersReportType(userType?: RoleName): ReportType {
  return userType
    ? REGISTERED_USERS_REPORT_TYPES[userType]
    : 'REGISTERED_USERS';
}
