"use client";

import { useState } from "react";
import { WorkspacePage } from "@/shared/components/layout/workspace-page";
import { REPORT_HISTORY_EMPTY_TYPE_MESSAGE } from "../constants/generated-report.constants";
import { REPORT_HISTORY_PAGE_SIZE } from "../constants/reports.constants";
import { ReportHistoryTable } from "../components/report-history-table";
import { ReportTableFooter } from "../components/report-table-footer";
import { ReportTypeFilter } from "../components/report-type-filter";
import { useReportHistory } from "../hooks/use-report-history";
import type { ReportType } from "../types/generated-report.types";

export function ReportHistoryView() {
  const [currentPage, setCurrentPage] = useState(1);
  const [reportType, setReportType] = useState<ReportType | undefined>(undefined);
  const { reports, totalItems, totalPages, isLoading, errorMessage, refresh } = useReportHistory(
    currentPage,
    reportType,
  );

  const handleReportTypeChange = (selectedReportType?: ReportType) => {
    setReportType(selectedReportType);
    setCurrentPage(1);
  };

  return (
    <WorkspacePage title="Historial de reportes">

      <div className="rounded-lg border border-border bg-surface p-4"><ReportTypeFilter value={reportType} onChange={handleReportTypeChange} /></div>

      <ReportHistoryTable
        reports={reports}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage={reportType ? REPORT_HISTORY_EMPTY_TYPE_MESSAGE : undefined}
      />

      <ReportTableFooter
        currentPage={currentPage}
        pageSize={REPORT_HISTORY_PAGE_SIZE}
        totalItems={totalItems}
        totalPages={totalPages}
        isLoading={isLoading}
        itemLabel="reportes"
        onPageChange={setCurrentPage}
        onRefresh={refresh}
      />
    </WorkspacePage>
  );
}