import { apiClient } from "@/shared/services/api-client";
import {
  CERTIFICATION_DOCUMENT_FIELD_NAME,
  CERTIFICATIONS_ENDPOINT,
  getCertificationDocumentEndpoint,
} from "../config/certification-api.config";
import { NOT_FOUND_STATUS } from "@/modules/profile/constants/http-status.constants";
import type { ApiResponse } from "@/modules/profile/types/api-response.types";
import type { Certification } from "../types/certification.types";
import type { CreateCertificationDto } from "../types/create-certification-dto.types";
import type { UpdateCertificationDto } from "../types/update-certification-dto.types";
import { getAuthHeaders } from "@/modules/profile/utils/get-auth-headers";
import { getHttpStatus } from "@/modules/profile/utils/get-http-status";

export const certificationsService = {
  getCertifications: async (): Promise<Certification[]> => {
    const response = await apiClient.get<ApiResponse<Certification[]>>(CERTIFICATIONS_ENDPOINT, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  },

  createCertification: async (data: CreateCertificationDto): Promise<Certification> => {
    const response = await apiClient.post<ApiResponse<Certification>>(
      CERTIFICATIONS_ENDPOINT,
      data,
      { headers: getAuthHeaders() },
    );
    return response.data.data;
  },

  updateCertification: async (
    id: string,
    data: UpdateCertificationDto,
  ): Promise<Certification> => {
    const response = await apiClient.patch<ApiResponse<Certification>>(
      `${CERTIFICATIONS_ENDPOINT}/${id}`,
      data,
      { headers: getAuthHeaders() },
    );
    return response.data.data;
  },

  deleteCertification: async (id: string): Promise<void> => {
    await apiClient.delete(`${CERTIFICATIONS_ENDPOINT}/${id}`, { headers: getAuthHeaders() });
  },

  uploadDocument: async (id: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append(CERTIFICATION_DOCUMENT_FIELD_NAME, file);
    await apiClient.put(getCertificationDocumentEndpoint(id), formData, {
      headers: getAuthHeaders(),
    });
  },

  getDocument: async (id: string): Promise<Blob | null> => {
    try {
      const response = await apiClient.get<Blob>(getCertificationDocumentEndpoint(id), {
        responseType: "blob",
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      if (getHttpStatus(error) === NOT_FOUND_STATUS) {
        return null;
      }
      throw error;
    }
  },

  deleteDocument: async (id: string): Promise<void> => {
    await apiClient.delete(getCertificationDocumentEndpoint(id), { headers: getAuthHeaders() });
  },
};
