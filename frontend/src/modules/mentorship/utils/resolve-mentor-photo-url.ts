import { apiClient } from "@/shared/services/api-client";

export function resolveMentorPhotoUrl(photoUrl: string | null): string | null {
  return photoUrl ? apiClient.getUri({ url: photoUrl }) : null;
}
