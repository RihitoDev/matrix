"use client";

import { useEffect, useState } from "react";
import { requestReviewService } from "../services/request-review.service";
import type { InboxSummary } from "../types/inbox-summary.types";

type SummaryState = { attempt: number; summary: InboxSummary | null; error: string | null };

export function useInboxSummary() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<SummaryState | null>(null);

  useEffect(() => {
    let cancelled = false;
    requestReviewService.getSummary().then((response) => {
      if (cancelled) return;
      setState(
        response.ok
          ? { attempt, summary: response.data, error: null }
          : { attempt, summary: null, error: response.message },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const isLoading = state?.attempt !== attempt;

  return {
    summary: isLoading ? null : (state?.summary ?? null),
    error: isLoading ? null : (state?.error ?? null),
    isLoading,
    retry: () => setAttempt((current) => current + 1),
  };
}
