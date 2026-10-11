"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorDetail } from "@/shared/utils/api-error-detail";
import { AVAILABILITY_QUERY_KEYS } from "../constants/availability-query-keys.constants";
import { AVAILABILITY_TOAST_TEXT } from "../constants/availability-toast.constants";
import { DELETE_BLOCK_ERROR } from "../constants/delete-block.constants";
import { availabilityApi } from "../services/availability.api";

export function useDeleteBlock() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: string) => availabilityApi.deleteAvailabilityBlock(id),
    onSuccess: () => {
      toast.success(AVAILABILITY_TOAST_TEXT.blockDeleted);
      return queryClient.invalidateQueries({ queryKey: AVAILABILITY_QUERY_KEYS.all });
    },
    onError: (error) => {
      toast.error(getApiErrorDetail(error) ?? DELETE_BLOCK_ERROR);
    },
  });

  const deleteBlock = async (id: string): Promise<boolean> => {
    try {
      await mutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  return { deleteBlock, isDeleting: mutation.isPending };
}
