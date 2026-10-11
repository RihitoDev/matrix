"use client";

import { useState } from "react";
import { PageBreadcrumb } from "@/shared/components/layout";
import { REPORT_HISTORY_EMPTY_TYPE_MESSAGE } from "../constants/generated-report.constants";
import { REPORT_HISTORY_BREADCRUMB } from "../constants/reports.constants";
import { ReportHistoryTable } from "../components/report-history-table";
import { ReportTypeFilter } from "../components/report-type-filter";
import { TablePagination } from "../components/table-pagination";
import { useReportHistory } from "../hooks/use-report-history";
import type { ReportType } from "../types/generated-report.types";

export function ReportHistoryView() {
  const [currentPage, setCurrentPage] = useState(1);
  const [reportType, setReportType] = useState<ReportType | undefined>(undefined);
  const { reports, totalPages, isLoading, errorMessage } = useReportHistory(currentPage, reportType);

  const handleReportTypeChange = (selectedReportType?: ReportType) => {
    setReportType(selectedReportType);
    setCurrentPage(1);
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <PageBreadcrumb items={REPORT_HISTORY_BREADCRUMB} />
        <h1 className="font-tight text-3xl font-extrabold text-ink">Historial de Reportes Generados</h1>
      </header>

      <ReportTypeFilter value={reportType} onChange={handleReportTypeChange} />

      <ReportHistoryTable
        reports={reports}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage={reportType ? REPORT_HISTORY_EMPTY_TYPE_MESSAGE : undefined}
      />

      <div className="flex justify-end">
        <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </section>
  );
}
