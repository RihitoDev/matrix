export type ReportType = 'REGISTERED_USERS' | 'GRADUATES' | 'REJECTED_USERS';

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
