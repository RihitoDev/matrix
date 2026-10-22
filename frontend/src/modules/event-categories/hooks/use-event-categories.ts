"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { eventCategoriesService } from "../services/event-categories.service";

export function useEventCategories() {
  const queryClient = useQueryClient();
  const queryKey = ["event-categories"];
  const query = useQuery({ queryKey, queryFn: () => eventCategoriesService.getAll() });
  return {
    categories: query.data ?? [],
    isLoading: query.isFetching,
    error: query.isError && !query.isFetching ? "No se pudieron cargar las categorías." : null,
    retry: () => { void queryClient.resetQueries({ queryKey, exact: true }); },
  };
}
