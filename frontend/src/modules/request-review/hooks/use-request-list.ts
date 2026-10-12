"use client";

import { useEffect, useState } from "react";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { ALL_CAREERS_VALUE, DEFAULT_PERIOD, MIN_SEARCH_LENGTH, SEARCH_DEBOUNCE_MS } from "../constants/inbox-filters.constants";
import { REVIEW_PAGE_SIZE } from "../constants/request-review.constants";
import { requestReviewService } from "../services/request-review.service";
import type { InboxPeriod } from "../types/inbox-filters.types";
import type { ReviewListItem, ReviewStatus } from "../types/request-review.types";

export function useRequestList() {
  const [status, setStatus] = useState<ReviewStatus>("pending");
  const [searchInput, setSearchInput] = useState("");
  const [career, setCareer] = useState(ALL_CAREERS_VALUE);
  const [period, setPeriod] = useState<InboxPeriod>(DEFAULT_PERIOD);
  const debouncedSearch = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS);
  const search = debouncedSearch.length >= MIN_SEARCH_LENGTH ? debouncedSearch : "";
  const careerFilter = career === ALL_CAREERS_VALUE ? "" : career;

  const filterKey = `${status}|${search}|${careerFilter}|${period}`;
  const [pageState, setPageState] = useState({ key: filterKey, page: 1 });
  const page = pageState.key === filterKey ? pageState.page : 1;

  const [result, setResult] = useState<{ key: string; items: ReviewListItem[]; total: number; error: string | null } | null>(
    null,
  );
  const key = `${filterKey}:${page}`;

  useEffect(() => {
    let cancelled = false;
    requestReviewService
      .listRequests(status, page, undefined, { search, career: careerFilter, period })
      .then((response) => {
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
  }, [status, page, search, careerFilter, period, key]);

  const isLoading = result?.key !== key;
  const items = result?.items ?? [];
  const total = result?.total ?? 0;
  const error = isLoading ? null : (result?.error ?? null);
  const hasActiveFilters = searchInput.trim() !== "" || career !== ALL_CAREERS_VALUE || period !== DEFAULT_PERIOD;

  function clearFilters() {
    setSearchInput("");
    setCareer(ALL_CAREERS_VALUE);
    setPeriod(DEFAULT_PERIOD);
  }

  const totalPages = Math.max(1, Math.ceil(total / REVIEW_PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * REVIEW_PAGE_SIZE + 1;
  const to = Math.min(page * REVIEW_PAGE_SIZE, total);

  return {
    status,
    changeStatus: setStatus,
    searchInput,
    career,
    period,
    changeSearch: setSearchInput,
    changeCareer: setCareer,
    changePeriod: setPeriod,
    clearFilters,
    hasActiveFilters,
    page,
    goToPrevious: () => setPageState({ key: filterKey, page: Math.max(1, page - 1) }),
    goToNext: () => setPageState({ key: filterKey, page: Math.min(totalPages, page + 1) }),
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
