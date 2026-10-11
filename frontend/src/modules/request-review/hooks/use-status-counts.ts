"use client";

import { useEffect, useState } from "react";
import { requestReviewService } from "../services/request-review.service";
import type { ReviewStatus } from "../types/request-review.types";
import type { StatusCounts } from "../types/status-counts.types";

// Un conteo por estado con el endpoint de listado existente (limit=1, se lee el total).
// Si una llamada falla, solo falta ese conteo: no hay error visible.
export function useStatusCounts(statuses: readonly ReviewStatus[]): StatusCounts {
  const [counts, setCounts] = useState<StatusCounts>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all(statuses.map((status) => requestReviewService.listRequests(status, 1, 1))).then((results) => {
      if (cancelled) return;
      const next: StatusCounts = {};
      results.forEach((result, index) => {
        if (result.ok) next[statuses[index]] = result.data.total;
      });
      setCounts(next);
    });
    return () => {
      cancelled = true;
    };
  }, [statuses]);

  return counts;
}
