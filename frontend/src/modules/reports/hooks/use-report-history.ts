"use client";

import { useEffect, useState } from "react";
import { REPORT_HISTORY_PAGE_SIZE } from "../constants/reports.constants";
import { reportsService } from "../services/reports.service";
import type { ReportHistoryState, ReportType } from "../types/generated-report.types";

export function useReportHistory(page: number, reportType?: ReportType) {
  const [state, setState] = useState<ReportHistoryState | null>(null);
  const requestKey = `${page}-${reportType ?? "ALL"}`;

  useEffect(() => {
    let isCancelled = false;

    reportsService
      .getReportHistory({ page, limit: REPORT_HISTORY_PAGE_SIZE, reportType })
      .then((response) => {
        if (!isCancelled) setState({ requestKey, result: response.data });
      })
      .catch(() => {
        if (!isCancelled) setState({ requestKey, errorMessage: "No se pudo cargar el historial de reportes." });
      });

    return () => {
      isCancelled = true;
    };
  }, [page, reportType, requestKey]);

  const isCurrentRequest = state?.requestKey === requestKey;
  const totalItems = state?.result?.totalItems ?? 0;

  return {
    reports: isCurrentRequest ? (state.result?.items ?? []) : [],
    totalPages: Math.max(1, Math.ceil(totalItems / REPORT_HISTORY_PAGE_SIZE)),
    isLoading: !isCurrentRequest,
    errorMessage: isCurrentRequest ? state.errorMessage : undefined,
  };
}
