"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { REQUEST_REVIEW_QUERY_KEYS } from "../constants/request-review-query-keys.constants";
import { requestReviewService } from "../services/request-review.service";
import { unwrapReviewResult } from "../utils/unwrap-review-result";

export function useRequestDetail(id: string) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: REQUEST_REVIEW_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const detail = unwrapReviewResult(await requestReviewService.getRequestDetail(id));
      if (detail.status === "in_review") {
        void queryClient.invalidateQueries({ queryKey: REQUEST_REVIEW_QUERY_KEYS.inbox });
      }
      return detail;
    },
  });

  return {
    detail: query.data ?? null,
    error: query.error?.message ?? null,
    isLoading: query.isPending,
  };
}
