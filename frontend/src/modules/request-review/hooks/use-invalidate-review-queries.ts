"use client";

import { useQueryClient } from "@tanstack/react-query";
import { REQUEST_REVIEW_QUERY_KEYS } from "../constants/request-review-query-keys.constants";

export function useInvalidateReviewQueries() {
  const queryClient = useQueryClient();

  return (id: string) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: REQUEST_REVIEW_QUERY_KEYS.detail(id) }),
      queryClient.invalidateQueries({ queryKey: REQUEST_REVIEW_QUERY_KEYS.inbox }),
    ]);
}
