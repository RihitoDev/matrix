"use client";

import { useCallback, useEffect, useState } from "react";
import { isConnectionError } from "@/shared/utils/is-connection-error";
import { REGISTERED_USERS_PAGE_SIZE, SLOW_REQUEST_THRESHOLD_MS } from "../constants/reports.constants";
import { reportsService } from "../services/reports.service";
import type { AcademicPeriod, RegisteredUsersState } from "../types/registered-user.types";
import type { RoleTag } from "@/modules/auth/types/auth-types";

export function useRegisteredUsers(page: number, userType?: RoleTag, period?: AcademicPeriod, search = "") {
  const [state, setState] = useState<RegisteredUsersState | null>(null);
  const [slowRequestKey, setSlowRequestKey] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const requestKey = `${page}-${userType ?? "ALL"}-${period ?? "ALL"}-${search}-${refreshCount}`;

  useEffect(() => {
    let isCancelled = false;

    const slowTimer = setTimeout(() => {
      if (!isCancelled) setSlowRequestKey(requestKey);
    }, SLOW_REQUEST_THRESHOLD_MS);

    reportsService
      .getRegisteredUsers({ page, limit: REGISTERED_USERS_PAGE_SIZE, userType, period, search })
      .then((response) => {
        if (!isCancelled) setState({ requestKey, result: response.data });
      })
      .catch((error: unknown) => {
        if (isCancelled) return;
        const hasConnectionError = isConnectionError(error);

        setState((previous) => ({
          requestKey,
          result: hasConnectionError ? previous?.result : undefined,
          errorMessage: "No se pudo cargar el reporte de usuarios registrados.",
          hasConnectionError,
        }));
      })
      .finally(() => clearTimeout(slowTimer));

    return () => {
      isCancelled = true;
      clearTimeout(slowTimer);
    };
  }, [page, userType, period, search, requestKey]);

  const refresh = useCallback(() => setRefreshCount((count) => count + 1), []);

  const isCurrentRequest = state?.requestKey === requestKey;
  const users = isCurrentRequest ? (state.result?.items ?? []) : [];
  const totalItems = state?.result?.totalItems ?? 0;

  return {
    users,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / REGISTERED_USERS_PAGE_SIZE)),
    isLoading: !isCurrentRequest,
    errorMessage: isCurrentRequest && users.length === 0 ? state.errorMessage : undefined,
    isSlow: !isCurrentRequest && slowRequestKey === requestKey,
    hasConnectionError: isCurrentRequest && Boolean(state.hasConnectionError),
    refresh,
  };
}
