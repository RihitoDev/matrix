import { apiClient } from "@/shared/services/api-client";
import { CV_ENDPOINT, CV_UPLOAD_FIELD_NAME } from "../constants/cv-api.constants";
import type { ApiResponse } from "@/modules/profile/types/api-response.types";
import type { CvResponse } from "../types/cv-response.types";
import type { SavedCv } from "../types/saved-cv.types";
import { getAuthHeaders } from "@/modules/profile/utils/get-auth-headers";
import { toSavedCv } from "../utils/to-saved-cv";

export const documentsService = {
  getCv: async (): Promise<SavedCv | null> => {
    const response = await apiClient.get<ApiResponse<CvResponse | null>>(CV_ENDPOINT, {
      headers: getAuthHeaders(),
    });
    const cv = response.data.data;
    return cv ? toSavedCv(cv) : null;
  },

  uploadCv: async (file: File): Promise<SavedCv | null> => {
    const formData = new FormData();
    formData.append(CV_UPLOAD_FIELD_NAME, file);
    const response = await apiClient.put<ApiResponse<CvResponse | null>>(CV_ENDPOINT, formData, {
      headers: getAuthHeaders(),
    });
    const cv = response.data.data;
    return cv ? toSavedCv(cv) : null;
  },

  deleteCv: async (): Promise<void> => {
    await apiClient.delete(CV_ENDPOINT, { headers: getAuthHeaders() });
  },
};
