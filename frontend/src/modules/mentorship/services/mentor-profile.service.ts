import { isAxiosError } from "axios";
import { apiClient } from "@/shared/services/api-client";
import type { ApiResponse } from "@/shared/types/api-response.types";
import type { MentorProfile } from "../types/mentor-profile.types";
import { resolveMentorPhotoUrl } from "../utils/resolve-mentor-photo-url";

export async function getMentorProfile(
  mentorId: string,
  signal?: AbortSignal,
): Promise<MentorProfile | null> {
  try {
    const response = await apiClient.get<ApiResponse<MentorProfile>>(
      `/mentors/${mentorId}`,
      { signal },
    );

    const mentor = response.data.data;

    return mentor?.photoUrl
      ? { ...mentor, photoUrl: resolveMentorPhotoUrl(mentor.photoUrl) }
      : mentor;
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined;

    if (status === 400 || status === 404) {
      return null;
    }

    throw error;
  }
}
