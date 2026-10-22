"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CV_ERROR_MESSAGES } from "../constants/cv-error-messages.constants";
import { documentsService } from "../services/documents.service";
import type { SavedCv } from "../types/saved-cv.types";
import { getCvErrorMessage } from "../utils/get-cv-error-message";

export function useCvDocument() {
  const queryClient = useQueryClient();
  const queryKey = ["documents", "cv"];
  const query = useQuery({ queryKey, queryFn: ({ signal }) => {
    signal.throwIfAborted();
    return documentsService.getCv();
  } });
  const mutation = useMutation({
    mutationFn: async (file: File | null) => file ? documentsService.uploadCv(file) : documentsService.deleteCv().then(() => null),
    onMutate: () => queryClient.cancelQueries({ queryKey, exact: true }),
    onSuccess: (cv) => { queryClient.setQueryData<SavedCv | null>(queryKey, cv); },
  });
  return {
    savedCv: query.data ?? null,
    isLoading: query.isFetching,
    loadError: query.error ? getCvErrorMessage(query.error, CV_ERROR_MESSAGES.load) : null,
    uploadCv: async (file: File): Promise<void> => { await mutation.mutateAsync(file); },
    deleteCv: async (): Promise<void> => { await mutation.mutateAsync(null); },
  };
}
