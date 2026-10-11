import { apiClient } from "@/shared/services/api-client";
import { EDUCATIONS_ENDPOINT } from "../constants/education-api.constants";
import type { ApiResponse } from "@/modules/profile/types/api-response.types";
import type { EducationItem } from "../types/education-item.types";
import type { EducationPayload } from "../types/education-payload.types";
import type { UpdateEducationPayload } from "../types/update-education-payload.types";
import { getAuthHeaders } from "@/modules/profile/utils/get-auth-headers";

export const educationsService = {
  getEducations: async (): Promise<EducationItem[]> => {
    const response = await apiClient.get<ApiResponse<EducationItem[]>>(EDUCATIONS_ENDPOINT, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  },

  createEducation: async (payload: EducationPayload): Promise<EducationItem> => {
    const response = await apiClient.post<ApiResponse<EducationItem>>(
      EDUCATIONS_ENDPOINT,
      payload,
      { headers: getAuthHeaders() },
    );
    return response.data.data;
  },

  updateEducation: async (id: string, payload: UpdateEducationPayload): Promise<EducationItem> => {
    const response = await apiClient.patch<ApiResponse<EducationItem>>(
      `${EDUCATIONS_ENDPOINT}/${id}`,
      payload,
      { headers: getAuthHeaders() },
    );
    return response.data.data;
  },

  deleteEducation: async (id: string): Promise<void> => {
    await apiClient.delete(`${EDUCATIONS_ENDPOINT}/${id}`, { headers: getAuthHeaders() });
  },
};
