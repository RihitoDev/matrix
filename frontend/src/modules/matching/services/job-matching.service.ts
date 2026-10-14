import { apiClient } from "@/shared/services/api-client";
import type { ApiResponse } from "@/shared/types/api-response.types";
import { getJobMatchEndpoint, RECOMMENDED_JOBS_ENDPOINT } from "../constants/job-matching.constants";
import type { JobMatch, RecommendationsResult } from "../types/job-matching.types";

export const jobMatchingService = {
  getRecommendations: async (): Promise<RecommendationsResult> => {
    const response = await apiClient.get<ApiResponse<RecommendationsResult>>(RECOMMENDED_JOBS_ENDPOINT);
    return response.data.data;
  },
  getJobMatch: async (jobOfferId: string): Promise<JobMatch> => {
    const response = await apiClient.get<ApiResponse<JobMatch>>(getJobMatchEndpoint(jobOfferId));
    return response.data.data;
  },
};
