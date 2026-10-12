"use client";

import { useEffect, useState } from "react";
import { REPORT_HISTORY_PAGE_SIZE } from "../constants/reports.constants";
import { reportsService } from "../services/reports.service";
import type { ReportHistoryState } from "../types/generated-report.types";

export function useReportHistory(page: number) {
  const [state, setState] = useState<ReportHistoryState | null>(null);

  useEffect(() => {
    let isCancelled = false;

    reportsService
      .getReportHistory({ page, limit: REPORT_HISTORY_PAGE_SIZE })
      .then((response) => {
        if (!isCancelled) setState({ page, result: response.data });
      })
      .catch(() => {
        if (!isCancelled) setState({ page, errorMessage: "No se pudo cargar el historial de reportes." });
      });

    return () => {
      isCancelled = true;
    };
  }, [page]);

  const isCurrentPage = state?.page === page;
  const totalItems = state?.result?.totalItems ?? 0;

  return {
    reports: isCurrentPage ? (state.result?.items ?? []) : [],
    totalPages: Math.max(1, Math.ceil(totalItems / REPORT_HISTORY_PAGE_SIZE)),
    isLoading: !isCurrentPage,
    errorMessage: isCurrentPage ? state.errorMessage : undefined,
  };
}
