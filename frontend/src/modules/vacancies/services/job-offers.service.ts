import { apiClient } from "@/shared/services/api-client";
import type { ApiResponse } from "@/modules/profile/types/api-response.types";
import type { CreateJobOfferPayload, CreateJobOfferResponse } from "../types/job-offer.types";

function buildJobOffersEndpoint(companyId: string): string {
  return `/v1/empresas/${companyId}/ofertas`;
}

export const jobOffersService = {
  publish: async (
    companyId: string,
    payload: CreateJobOfferPayload,
  ): Promise<CreateJobOfferResponse> => {
    const response = await apiClient.post<ApiResponse<CreateJobOfferResponse>>(
      buildJobOffersEndpoint(companyId),
      payload,
    );
    return response.data.data;
  },
};
