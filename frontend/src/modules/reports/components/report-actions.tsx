import type { ReportActionsProps } from "../types/report-actions-props.types";
import { ExportCsvButton } from "./export-csv-button";
import { ManagementMenu } from "./management-menu";

export function ReportActions({ onExport, isExporting, period, onPeriodChange }: ReportActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ExportCsvButton onClick={onExport} isExporting={isExporting} />
      <ManagementMenu value={period} onChange={onPeriodChange} />
    </div>
  );
}
