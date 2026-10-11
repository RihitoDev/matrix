"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorDetail } from "@/shared/utils/api-error-detail";
import { UPDATE_BLOCK_ERROR } from "../constants/availability.constants";
import { AVAILABILITY_QUERY_KEYS } from "../constants/availability-query-keys.constants";
import { AVAILABILITY_TOAST_TEXT } from "../constants/availability-toast.constants";
import { availabilityApi } from "../services/availability.api";
import type { AvailabilityBlock } from "../types/availability-block.types";
import type { CreateAvailabilityBlockInput } from "../types/create-availability-block-input.types";
import type { UpdateBlockVariables } from "../types/update-block-variables.types";

export function useUpdateAvailabilityBlock() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, input }: UpdateBlockVariables) =>
      availabilityApi.updateAvailabilityBlock(id, input),
    onSuccess: () => {
      toast.success(AVAILABILITY_TOAST_TEXT.blockUpdated);
      return queryClient.invalidateQueries({ queryKey: AVAILABILITY_QUERY_KEYS.all });
    },
    onError: (error) => {
      toast.error(getApiErrorDetail(error) ?? UPDATE_BLOCK_ERROR);
    },
  });

  const updateBlock = async (
    id: string,
    input: Partial<CreateAvailabilityBlockInput>,
  ): Promise<AvailabilityBlock | null> => {
    try {
      return await mutation.mutateAsync({ id, input });
    } catch {
      return null;
    }
  };

  return { updateBlock, isSubmitting: mutation.isPending };
}
