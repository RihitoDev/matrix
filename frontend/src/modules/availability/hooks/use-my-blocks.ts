"use client";

import { useQuery } from "@tanstack/react-query";
import { getWeekRange } from "@/shared/utils/date-time";
import { AVAILABILITY_QUERY_KEYS } from "../constants/availability-query-keys.constants";
import { MY_AVAILABILITY_TEXT } from "../constants/my-availability.constants";
import { availabilityApi } from "../services/availability.api";

export function useMyBlocks(weekStart: string) {
  const query = useQuery({
    queryKey: AVAILABILITY_QUERY_KEYS.myBlocks(weekStart),
    queryFn: () => {
      const { startAt, endAt } = getWeekRange(weekStart);
      return availabilityApi.getAvailabilityBlocks({ from: startAt, to: endAt });
    },
  });

  return {
    blocks: query.data ?? [],
    isLoading: query.isPending,
    error: query.isError ? MY_AVAILABILITY_TEXT.loadError : null,
  };
}
