"use client";

import { useState } from "react";
import { PageBreadcrumb } from "@/shared/components/layout";
import { REPORT_HISTORY_BREADCRUMB } from "../constants/reports.constants";
import { ReportHistoryTable } from "../components/report-history-table";
import { TablePagination } from "../components/table-pagination";
import { useReportHistory } from "../hooks/use-report-history";

export function ReportHistoryView() {
  const [currentPage, setCurrentPage] = useState(1);
  const { reports, totalPages, isLoading, errorMessage } = useReportHistory(currentPage);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <PageBreadcrumb items={REPORT_HISTORY_BREADCRUMB} />
        <h1 className="font-tight text-3xl font-extrabold text-ink">Historial de Reportes Generados</h1>
      </header>

      <ReportHistoryTable reports={reports} isLoading={isLoading} errorMessage={errorMessage} />

      <div className="flex justify-end">
        <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </section>
  );
}
