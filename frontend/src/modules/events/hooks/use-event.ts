"use client";

import { useQuery } from "@tanstack/react-query";
import { isApiError } from "@/shared/services/api-client";
import { eventsService } from "../services/events.service";

export function useEvent(id: string | null) {
  const query = useQuery({
    queryKey: ["events", "detail", id],
    queryFn: ({ signal }) => eventsService.getEvent(id!, signal),
    enabled: id !== null,
  });
  const notFound = isApiError(query.error) && query.error.response?.status === 404;
  return {
    event: query.data ?? null,
    isLoading: id !== null && query.isFetching,
    error: query.isError && !query.isFetching ? notFound
      ? "El taller ya no está disponible o no existe."
      : "No se pudo cargar el detalle del taller. Inténtalo nuevamente." : null,
    notFound,
    retry: () => { void query.refetch(); },
  };
}
