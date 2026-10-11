import { apiClient } from "@/shared/services/api-client";
import { WORK_EXPERIENCES_ENDPOINT } from "../config/work-experience-api.config";
import type { ApiResponse } from "@/modules/profile/types/api-response.types";
import type { WorkExperienceItem } from "../types/work-experience-item.types";
import type { WorkExperiencePayload } from "../types/work-experience-payload.types";
import { getAuthHeaders } from "@/modules/profile/utils/get-auth-headers";

export const workExperienceService = {
  getWorkExperiences: async (): Promise<WorkExperienceItem[]> => {
    const response = await apiClient.get<ApiResponse<WorkExperienceItem[]>>(
      WORK_EXPERIENCES_ENDPOINT,
      { headers: getAuthHeaders() },
    );
    return response.data.data;
  },

  createWorkExperience: async (payload: WorkExperiencePayload): Promise<WorkExperienceItem> => {
    const response = await apiClient.post<ApiResponse<WorkExperienceItem>>(
      WORK_EXPERIENCES_ENDPOINT,
      payload,
      { headers: getAuthHeaders() },
    );
    return response.data.data;
  },

  updateWorkExperience: async (
    id: string,
    payload: WorkExperiencePayload,
  ): Promise<WorkExperienceItem> => {
    const response = await apiClient.patch<ApiResponse<WorkExperienceItem>>(
      `${WORK_EXPERIENCES_ENDPOINT}/${id}`,
      payload,
      { headers: getAuthHeaders() },
    );
    return response.data.data;
  },

  deleteWorkExperience: async (id: string): Promise<void> => {
    await apiClient.delete(`${WORK_EXPERIENCES_ENDPOINT}/${id}`, { headers: getAuthHeaders() });
  },
};
