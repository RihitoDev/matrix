import { apiClient } from "@/shared/services/api-client";
import type { ApiResponse } from "@/shared/types/api-response.types";
import type { MentorDirectoryItem } from "../types/mentor-directory.types";

export async function getMentorDirectory(
  signal?: AbortSignal,
): Promise<MentorDirectoryItem[]> {
  const response = await apiClient.get<ApiResponse<MentorDirectoryItem[]>>(
    "/mentors",
    { signal },
  );

  return response.data.data;
}
