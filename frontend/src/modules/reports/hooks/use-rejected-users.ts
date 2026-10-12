"use client";

import { useCallback, useEffect } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { REJECTED_USERS_LOAD_ERROR_MESSAGE, REJECTED_USERS_PAGE_SIZE } from "../constants/reports.constants";
import { REPORTS_QUERY_KEYS } from "../constants/reports-query-keys.constants";
import { reportsService } from "../services/reports.service";
import { getReportErrorAlert } from "../utils/get-report-error-alert";
import { showReportAlert } from "../utils/show-report-alert";

export function useRejectedUsers(page: number, search = "") {
  const query = useQuery({
    queryKey: REPORTS_QUERY_KEYS.rejectedUsers(page, search),
    queryFn: ({ signal }) => reportsService.getRejectedUsers({ page, limit: REJECTED_USERS_PAGE_SIZE, search }, signal),
    placeholderData: keepPreviousData,
  });
  const { error, errorUpdatedAt, refetch } = query;

  useEffect(() => {
    const alert = getReportErrorAlert(error);
    if (alert) showReportAlert(alert, `rejected-users-${errorUpdatedAt}`);
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
