"use client";

import { useQuery } from "@tanstack/react-query";
import { isApiError } from "@/shared/services/api-client";
import { registrationsService } from "../services/registrations.service";

export function useMyPasses() {
  const query = useQuery({
    queryKey: ["events", "my-passes"],
    queryFn: ({ signal }) => registrationsService.getMine(signal),
  });
  const cause = query.error;
  return {
    registrations: query.data ?? [],
    isLoading: query.isFetching,
    error: query.isError && !query.isFetching
      ? isApiError(cause) && cause.response?.status === 401
        ? "La sesión ha expirado. Inicia sesión nuevamente."
        : cause instanceof Error && !isApiError(cause)
          ? cause.message
          : "No se pudieron cargar tus inscripciones. Inténtalo nuevamente."
      : null,
    retry: () => { void query.refetch(); },
  };
}
