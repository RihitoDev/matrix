import type { AcademicPeriod } from "./registered-user.types";

export interface ReportActionsProps {
  onExport?: () => void;
  isExporting?: boolean;
  period?: AcademicPeriod;
  onPeriodChange: (period?: AcademicPeriod) => void;
}
