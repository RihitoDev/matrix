import { apiClient } from "@/shared/services/api-client";
import { EDUCATIONS_ENDPOINT, EDUCATION_INSTITUTIONS_ENDPOINT } from "../constants/education-api.constants";
import { EDUCATION_INSTITUTION_TEXTS } from "../constants/education-institutions.constants";
import type { EducationInstitution } from "../types/education-institution.types";
import type { ApiResponse } from "@/modules/profile/types/api-response.types";
import type { EducationItem } from "../types/education-item.types";
import type { EducationPayload } from "../types/education-payload.types";
import type { UpdateEducationPayload } from "../types/update-education-payload.types";
import { getAuthHeaders } from "@/modules/profile/utils/get-auth-headers";

export const educationsService = {
  getInstitutions: async (): Promise<EducationInstitution[]> => {
    const response = await apiClient.get<ApiResponse<EducationInstitution[]>>(EDUCATION_INSTITUTIONS_ENDPOINT, {
      headers: getAuthHeaders(),
    });
    const institutions = response.data?.data;
    if (!Array.isArray(institutions) || !institutions.length || institutions.some((item) =>
      !item || typeof item.name !== "string" || !item.name.trim() || !Array.isArray(item.aliases)
      || item.aliases.some((alias: unknown) => typeof alias !== "string"),
    )) {
      throw new Error(EDUCATION_INSTITUTION_TEXTS.loadError);
    }
    return institutions;
  },

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
