"use client";

import { useQueries } from "@tanstack/react-query";
import { REQUEST_REVIEW_QUERY_KEYS } from "../constants/request-review-query-keys.constants";
import { requestReviewService } from "../services/request-review.service";
import type { ReviewStatus } from "../types/request-review.types";
import type { StatusCounts } from "../types/status-counts.types";
import { unwrapReviewResult } from "../utils/unwrap-review-result";

export function useStatusCounts(statuses: readonly ReviewStatus[]): StatusCounts {
  return useQueries({
    queries: statuses.map((status) => ({
      queryKey: REQUEST_REVIEW_QUERY_KEYS.count(status),
      queryFn: async () => unwrapReviewResult(await requestReviewService.listRequests(status, 1, 1)).total,
    })),
    combine: (results) => {
      const counts: StatusCounts = {};
      results.forEach((result, index) => {
        if (typeof result.data === "number") counts[statuses[index]] = result.data;
      });
      return counts;
    },
  });
}
