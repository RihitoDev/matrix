import { apiClient } from "@/shared/services/api-client";
import type { ApiResponse } from "@/shared/types/api-response.types";
import type { TechnicalAreaResponse } from "../types/technical-area-response.types";

export async function getTechnicalAreas(
  signal?: AbortSignal,
): Promise<TechnicalAreaResponse[]> {
  const response = await apiClient.get<ApiResponse<TechnicalAreaResponse[]>>(
    "/technical-areas",
    { signal },
  );
  return response.data.data;
}
