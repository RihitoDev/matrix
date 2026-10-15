"use client";

import { useQuery } from "@tanstack/react-query";
import { REQUEST_REVIEW_QUERY_KEYS } from "../constants/request-review-query-keys.constants";
import { requestReviewService } from "../services/request-review.service";
import { unwrapReviewResult } from "../utils/unwrap-review-result";

export function useInboxSummary() {
  const query = useQuery({
    queryKey: REQUEST_REVIEW_QUERY_KEYS.summary,
    queryFn: async () => unwrapReviewResult(await requestReviewService.getSummary()),
  });

  return {
    summary: query.data ?? null,
    error: query.error?.message ?? null,
    isLoading: query.isPending,
    retry: () => void query.refetch(),
  };
}
