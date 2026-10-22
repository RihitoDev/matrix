"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EDUCATION_FEEDBACK_MESSAGES } from "../constants/education-feedback.constants";
import { educationsService } from "../services/educations.service";

export function useEducations() {
  const queryClient = useQueryClient();
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);
  const queryKey = ["education", "educations"];
  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      signal.throwIfAborted();
      const items = await educationsService.getEducations();
      return items;
    },
  });
  async function reload() {
    if (!mountedRef.current) return;
    await queryClient.cancelQueries({ queryKey, exact: true });
    await query.refetch();
  }
  return { educations: query.data ?? [], isLoading: query.isFetching,
    error: query.isError && !query.isFetching ? EDUCATION_FEEDBACK_MESSAGES.loadError : null, reload };
}
