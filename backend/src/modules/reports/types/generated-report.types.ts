import type { RoleName } from '../../../common/enums/roles.enum.js';

export const REPORT_TYPES = [
  'REGISTERED_USERS',
  'STUDENTS',
  'DEGREE_HOLDERS',
  'MENTORS',
  'COMPANIES',
  'ADMINS',
  'REJECTED_USERS',
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export const REGISTERED_USERS_REPORT_TYPES: Record<RoleName, ReportType> = {
  estudiante: 'STUDENTS',
  titulado: 'DEGREE_HOLDERS',
  mentor: 'MENTORS',
  empresa: 'COMPANIES',
  administrativo: 'ADMINS',
};

export interface GeneratedReport {
  readonly id: string;
  readonly fileName: string;
  readonly reportType: ReportType;
  readonly generatedAt: string;
}

export type RegisterGeneratedReportInput = Pick<
  GeneratedReport,
  'fileName' | 'reportType'
>;

export interface GeneratedReportsPage {
  readonly reports: GeneratedReport[];
  readonly total: number;
}
