"use client";

import { useQuery } from "@tanstack/react-query";
import { JOB_MATCHING_QUERY_KEYS } from "../constants/job-matching.constants";
import { jobMatchingService } from "../services/job-matching.service";

export function useJobMatch(jobOfferId: string) {
  return useQuery({
    queryKey: JOB_MATCHING_QUERY_KEYS.match(jobOfferId),
    queryFn: () => jobMatchingService.getJobMatch(jobOfferId),
    enabled: !!jobOfferId,
  });
}
