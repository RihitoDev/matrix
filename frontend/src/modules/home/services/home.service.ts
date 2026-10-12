import { apiClient } from "@/shared/services/api-client";
import type { ApiResponse } from "@/shared/types/api-response.types";

export const homeService = {
  getWelcomeMessage: async (): Promise<string> => {
    const response = await apiClient.get<ApiResponse<string>>("/");
    return response.data.data;
  },
};