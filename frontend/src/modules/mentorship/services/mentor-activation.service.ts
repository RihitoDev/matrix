import { apiClient } from "@/shared/services/api-client";
import type { ApiResponse } from "@/shared/types/api-response.types";
import type { ActivateMentorPayload } from "../types/activate-mentor-payload.types";
import type { ActivateMentorResponse } from "../types/activate-mentor-response.types";

export async function activateMentor(
  payload: ActivateMentorPayload,
): Promise<ActivateMentorResponse> {
  const response = await apiClient.post<ApiResponse<ActivateMentorResponse>>(
    "/mentors/activate",
    payload,
  );

  return response.data.data;
}
