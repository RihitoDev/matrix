"use client";

import { useEffect, useState } from "react";
import { REVIEW_PAGE_SIZE } from "../constants/request-review.constants";
import { requestReviewService } from "../services/request-review.service";
import type { ReviewListItem, ReviewStatus } from "../types/request-review.types";

export function useRequestList() {
  const [status, setStatus] = useState<ReviewStatus>("pending");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<{ key: string; items: ReviewListItem[]; total: number; error: string | null } | null>(
    null,
  );
  const key = `${status}:${page}`;

  useEffect(() => {
    let cancelled = false;
    requestReviewService.listRequests(status, page).then((response) => {
      if (cancelled) return;
      setResult(
        response.ok
          ? { key, items: response.data.items, total: response.data.total, error: null }
          : { key, items: [], total: 0, error: response.message },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [status, page, key]);

  // Mientras la respuesta guardada no corresponde a la pestaña y página actuales, se muestra la carga
  const isLoading = result?.key !== key;
  const items = result?.items ?? [];
  const total = result?.total ?? 0;
  const error = isLoading ? null : (result?.error ?? null);

  function changeStatus(next: ReviewStatus) {
    setStatus(next);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(total / REVIEW_PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * REVIEW_PAGE_SIZE + 1;
  const to = Math.min(page * REVIEW_PAGE_SIZE, total);

  return {
    status,
    changeStatus,
    page,
    goToPrevious: () => setPage((current) => Math.max(1, current - 1)),
    goToNext: () => setPage((current) => Math.min(totalPages, current + 1)),
    items,
    total,
    from,
    to,
    hasPrevious: page > 1,
    hasNext: page < totalPages,
    isLoading,
    error,
  };
}
