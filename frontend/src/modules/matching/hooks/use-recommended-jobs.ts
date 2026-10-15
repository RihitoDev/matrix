"use client";

import { useQuery } from "@tanstack/react-query";
import { JOB_MATCHING_QUERY_KEYS } from "../constants/job-matching.constants";
import { jobMatchingService } from "../services/job-matching.service";

export function useRecommendedJobs() {
  return useQuery({
    queryKey: JOB_MATCHING_QUERY_KEYS.recommendations,
    queryFn: jobMatchingService.getRecommendations,
  });
}
