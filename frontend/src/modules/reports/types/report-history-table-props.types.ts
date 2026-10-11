import type { GeneratedReport } from "./generated-report.types";

export interface ReportHistoryTableProps {
  reports: GeneratedReport[];
  isLoading: boolean;
  errorMessage?: string;
}
