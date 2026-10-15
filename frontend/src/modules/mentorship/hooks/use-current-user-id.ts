"use client";

import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/modules/profile/services/profile.service";
import { getAccessToken } from "@/shared/services/storage/access-token-storage";

export function useCurrentUserId() {
  const accessToken = getAccessToken();
  const profileQuery = useQuery({
    queryKey: ["mentorship", "current-user", accessToken],
    queryFn: () => profileService.getProfile(),
    enabled: accessToken !== null,
    retry: false,
  });

  const currentUserId = profileQuery.data?.id || null;

  return {
    currentUserId,
    canVerifyIdentity:
      accessToken === null ||
      (profileQuery.isSuccess && !profileQuery.isFetching && currentUserId !== null),
  };
}
