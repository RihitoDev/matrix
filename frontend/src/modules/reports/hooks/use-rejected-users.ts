"use client";

import { useCallback, useEffect } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError, isAxiosError } from "axios";
import { toast } from "sonner";
import { isConnectionError } from "@/shared/utils/is-connection-error";
import {
  CONNECTION_ERROR_MESSAGE,
  INTERNAL_ERROR_MESSAGE,
  RATE_LIMIT_MESSAGE,
  REJECTED_USERS_LOAD_ERROR_MESSAGE,
  REJECTED_USERS_PAGE_SIZE,
  REPORT_ALERT_DURATION_MS,
  SLOW_REQUEST_MESSAGE,
} from "../constants/reports.constants";
import { REPORTS_QUERY_KEYS } from "../constants/reports-query-keys.constants";
import { reportsService } from "../services/reports.service";

function notifyRequestError(error: unknown, id: string) {
  if (!isAxiosError(error)) return;

  const options = { id, duration: REPORT_ALERT_DURATION_MS, closeButton: true, richColors: true };

  if (error.code === AxiosError.ECONNABORTED || error.code === AxiosError.ETIMEDOUT) {
    toast.warning(SLOW_REQUEST_MESSAGE, options);
  } else if (error.response?.status === 429) {
    toast.warning(RATE_LIMIT_MESSAGE, options);
  } else if (error.response?.status === 500) {
    toast.error(INTERNAL_ERROR_MESSAGE, options);
  } else if (isConnectionError(error)) {
    toast.error(CONNECTION_ERROR_MESSAGE, options);
  }
}

export function useRejectedUsers(page: number, search = "") {
  const query = useQuery({
    queryKey: REPORTS_QUERY_KEYS.rejectedUsers(page, search),
    queryFn: ({ signal }) => reportsService.getRejectedUsers({ page, limit: REJECTED_USERS_PAGE_SIZE, search }, signal),
    placeholderData: keepPreviousData,
  });
  const { error, errorUpdatedAt, refetch } = query;

  useEffect(() => {
    if (error) notifyRequestError(error, `rejected-users-${errorUpdatedAt}`);
  }, [error, errorUpdatedAt]);

  const refresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const result = query.isError ? undefined : query.data?.data;
  const totalItems = result?.totalItems ?? 0;

  return {
    users: result?.items ?? [],
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / REJECTED_USERS_PAGE_SIZE)),
    isLoading: query.isFetching,
    errorMessage: query.isError && !query.isFetching ? REJECTED_USERS_LOAD_ERROR_MESSAGE : undefined,
    refresh,
  };
}
