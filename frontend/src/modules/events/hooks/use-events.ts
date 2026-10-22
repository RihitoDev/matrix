"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { eventsService } from "../services/events.service";
import { EVENTS_PAGE_SIZE, NO_EVENT_FILTERS } from "../constants/events.constants";
import type { EventFiltersPayload } from "../types/event-filters.types";

export function useEvents(filters: EventFiltersPayload = NO_EVENT_FILTERS) {
  const queryClient = useQueryClient();
  const search = filters.search.trim();
  const categoryId = filters.categoryId;
  const queryKey = ["events", "list", search, categoryId];
  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => eventsService.getEvents({
      page: pageParam, limit: EVENTS_PAGE_SIZE,
      ...(search && { search }), ...(categoryId && { categoryId }),
    }, signal),
    getNextPageParam: (lastPage, pages) => lastPage.data.length === EVENTS_PAGE_SIZE ? pages.length + 1 : undefined,
  });
  return {
    events: query.data?.pages.flatMap((page) => page.data) ?? [],
    error: query.isError && !query.isFetching ? "No se pudieron cargar los talleres. Revisa la conexión e inténtalo de nuevo." : null,
    hasMore: Boolean(query.hasNextPage),
    isLoading: query.isPending,
    isLoadingMore: query.isFetchingNextPage,
    loadMore: () => { if (query.hasNextPage && !query.isFetching) void query.fetchNextPage(); },
    retry: () => { void queryClient.resetQueries({ queryKey, exact: true }); },
  };
}
