"use client";

import { useCallback, useEffect, useState } from "react";
import { REJECTED_USERS_PAGE_SIZE } from "../constants/reports.constants";
import { reportsService } from "../services/reports.service";
import type { RejectedUsersState } from "../types/rejected-user.types";

export function useRejectedUsers(page: number, search = "") {
  const [state, setState] = useState<RejectedUsersState | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const requestKey = `${page}-${search}-${refreshCount}`;

  useEffect(() => {
    let isCancelled = false;

    reportsService
      .getRejectedUsers({ page, limit: REJECTED_USERS_PAGE_SIZE, search })
      .then((response) => {
        if (!isCancelled) setState({ requestKey, result: response.data });
      })
      .catch(() => {
        if (!isCancelled) {
          setState({ requestKey, errorMessage: "No se pudo cargar el reporte de usuarios rechazados." });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [page, search, requestKey]);

  const refresh = useCallback(() => setRefreshCount((count) => count + 1), []);

  const isCurrentRequest = state?.requestKey === requestKey;
  const totalItems = state?.result?.totalItems ?? 0;

  return {
    users: isCurrentRequest ? (state.result?.items ?? []) : [],
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / REJECTED_USERS_PAGE_SIZE)),
    isLoading: !isCurrentRequest,
    errorMessage: isCurrentRequest ? state.errorMessage : undefined,
    refresh,
  };
}
