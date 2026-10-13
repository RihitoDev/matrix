import type { ReportType } from "./generated-report.types";

export interface ReportTypeFilterProps {
  value?: ReportType;
  onChange: (reportType?: ReportType) => void;
}
