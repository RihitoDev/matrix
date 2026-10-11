import { apiClient } from "@/shared/services/api-client";
import type { ApiResponse } from "@/shared/types/api-response.types";
import type { OrientationTypeResponse } from "../types/orientation-type-response.types";

export async function getOrientationTypes(
  signal?: AbortSignal,
): Promise<OrientationTypeResponse[]> {
  const response = await apiClient.get<ApiResponse<OrientationTypeResponse[]>>(
    "/orientation-types",
    { signal },
  );
  return response.data.data;
}

export async function getMentorOrientationTypes(
  signal?: AbortSignal,
): Promise<OrientationTypeResponse[]> {
  const response = await apiClient.get<ApiResponse<OrientationTypeResponse[]>>(
    "/mentors/me/orientation-types",
    { signal },
  );
  return response.data.data;
}

export async function updateMentorOrientationTypes(
  orientationTypeIds: string[],
): Promise<void> {
  await apiClient.patch("/mentors/me/orientation-types", {
    orientationTypeIds,
  });
}
