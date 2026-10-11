"use client";

import { useQuery } from "@tanstack/react-query";
import type { WeekRange } from "@/shared/types/week-range.types";
import { AVAILABILITY_QUERY_KEYS } from "../constants/availability-query-keys.constants";
import {
  FREE_BLOCKS_STALE_TIME_MS,
  MENTOR_FREE_BLOCKS_TEXT,
} from "../constants/mentor-free-blocks.constants";
import { availabilityApi } from "../services/availability.api";

export function useMentorFreeBlocks(mentorId: string, weekRange: WeekRange) {
  const query = useQuery({
    queryKey: AVAILABILITY_QUERY_KEYS.freeBlocks(mentorId, weekRange.startAt),
    queryFn: () => availabilityApi.getMentorFreeBlocks(mentorId, weekRange),
    staleTime: FREE_BLOCKS_STALE_TIME_MS,
    refetchOnWindowFocus: "always",
  });

  return {
    blocks: query.data ?? [],
    isLoading: query.isPending,
    error: query.isError ? MENTOR_FREE_BLOCKS_TEXT.loadError : null,
  };
}
