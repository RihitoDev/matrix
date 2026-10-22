"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isApiError } from "@/shared/services/api-client";
import { getMentorOrientationTypes, getOrientationTypes, updateMentorOrientationTypes } from "../services/orientation-type.service";

export function useOrientationConfig() {
  const queryClient = useQueryClient();
  const queryKey = ["mentorship", "orientation-config"];
  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const [catalog, selected] = await Promise.allSettled([
        getOrientationTypes(signal), getMentorOrientationTypes(signal),
      ]);
      if (catalog.status === "rejected") throw catalog.reason;
      if (selected.status === "rejected") {
        if (isApiError(selected.reason) && selected.reason.response?.status === 404) {
          return { orientationTypes: catalog.value, savedIds: [] as string[], isMentorActive: false };
        }
        throw selected.reason;
      }
      return { orientationTypes: catalog.value, savedIds: selected.value.map(({ id }) => id), isMentorActive: true };
    },
  });
  const mutation = useMutation({
    mutationFn: (ids: string[]) => updateMentorOrientationTypes(ids),
    onSuccess: (_data, savedIds) => {
      queryClient.setQueryData<typeof query.data>(queryKey, (current) => current ? { ...current, savedIds } : current);
    },
  });
  return {
    orientationTypes: query.data?.orientationTypes ?? [],
    savedIds: query.data?.savedIds ?? [],
    isMentorActive: query.data?.isMentorActive ?? true,
    isLoading: query.isFetching,
    hasLoadError: query.isError,
    retry: () => { void query.refetch(); },
    save: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
}
