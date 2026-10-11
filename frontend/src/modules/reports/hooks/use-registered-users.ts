"use client";

import { useCallback, useEffect, useState } from "react";
import { REGISTERED_USERS_PAGE_SIZE } from "../constants/reports.constants";
import { reportsService } from "../services/reports.service";
import type { RegisteredUsersState, UserType } from "../types/registered-user.types";

export function useRegisteredUsers(page: number, userType?: UserType) {
  const [state, setState] = useState<RegisteredUsersState | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const requestKey = `${page}-${userType ?? "ALL"}-${refreshCount}`;

  useEffect(() => {
    let isCancelled = false;

    reportsService
      .getRegisteredUsers({ page, limit: REGISTERED_USERS_PAGE_SIZE, userType })
      .then((response) => {
        if (!isCancelled) setState({ requestKey, result: response.data });
      })
      .catch(() => {
        if (!isCancelled) {
          setState({ requestKey, errorMessage: "No se pudo cargar el reporte de usuarios registrados." });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [page, userType, requestKey]);

  const refresh = useCallback(() => setRefreshCount((count) => count + 1), []);

  const isCurrentRequest = state?.requestKey === requestKey;
  const totalItems = state?.result?.totalItems ?? 0;

  return {
    users: isCurrentRequest ? (state.result?.items ?? []) : [],
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / REGISTERED_USERS_PAGE_SIZE)),
    isLoading: !isCurrentRequest,
    errorMessage: isCurrentRequest ? state.errorMessage : undefined,
    refresh,
  };
}
