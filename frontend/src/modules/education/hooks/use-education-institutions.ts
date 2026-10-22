"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EDUCATION_INSTITUTION_TEXTS } from "../constants/education-institutions.constants";
import { educationsService } from "../services/educations.service";

export function useEducationInstitutions() {
  const queryClient = useQueryClient();
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);
  const queryKey = ["education", "institutions"];
  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      signal.throwIfAborted();
      const items = await educationsService.getInstitutions();
      return items;
    },
  });
  async function reload() {
    if (!mountedRef.current) return;
    await queryClient.cancelQueries({ queryKey, exact: true });
    await query.refetch();
  }
  return { institutions: query.data ?? [], isLoading: query.isFetching,
    error: query.isError && !query.isFetching ? EDUCATION_INSTITUTION_TEXTS.loadError : null, reload };
}
