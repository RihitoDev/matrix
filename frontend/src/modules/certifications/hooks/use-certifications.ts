"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CERTIFICATION_FEEDBACK_MESSAGES } from "../config/certification-feedback.config";
import { certificationsService } from "../services/certifications.service";
import { sortCertifications } from "../utils/sort-certifications";

export function useCertifications() {
  const queryClient = useQueryClient();
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);
  const queryKey = ["certifications", "certifications"];
  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      signal.throwIfAborted();
      const items = await certificationsService.getCertifications();
      return sortCertifications(items);
    },
  });
  async function reload() {
    if (!mountedRef.current) return;
    await queryClient.cancelQueries({ queryKey, exact: true });
    await query.refetch();
  }
  return { certifications: query.data ?? [], isLoading: query.isFetching,
    error: query.isError && !query.isFetching ? CERTIFICATION_FEEDBACK_MESSAGES.loadError : null, reload };
}
