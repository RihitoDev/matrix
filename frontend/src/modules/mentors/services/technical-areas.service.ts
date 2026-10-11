import { apiClient } from "@/shared/services/api-client";
import type { ApiResponse } from "@/shared/types/api-response.types";
import type { TechnicalAreaResponse } from "@/modules/mentorship/types/technical-area-response.types";

export async function getMentorTechnicalAreas(
  signal?: AbortSignal,
): Promise<TechnicalAreaResponse[]> {
  const response = await apiClient.get<ApiResponse<TechnicalAreaResponse[]>>(
    "/mentors/me/technical-areas",
    { signal },
  );
  return response.data.data;
}

export async function updateMentorTechnicalAreas(
  technicalAreaIds: string[],
): Promise<void> {
  await apiClient.patch("/mentors/me/technical-areas", { technicalAreaIds });
}
