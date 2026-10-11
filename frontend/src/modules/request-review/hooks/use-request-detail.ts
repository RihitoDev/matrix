"use client";

import { useEffect, useState } from "react";
import { requestReviewService } from "../services/request-review.service";
import type { ReviewDetail } from "../types/request-review.types";

export function useRequestDetail(id: string) {
  const [result, setResult] = useState<{ id: string; detail: ReviewDetail | null; error: string | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    requestReviewService.getRequestDetail(id).then((response) => {
      if (cancelled) return;
      setResult(response.ok ? { id, detail: response.data, error: null } : { id, detail: null, error: response.message });
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const isLoading = result?.id !== id;
  return { detail: isLoading ? null : (result?.detail ?? null), error: isLoading ? null : (result?.error ?? null), isLoading };
}
