"use client";

import { useQuery } from "@tanstack/react-query";
import { getRolesLabel } from "@/modules/auth";
import { profileService } from "@/modules/profile";
import { useAuth } from "@/shared/contexts/auth-context";
import { getAccessToken } from "@/shared/services/storage/access-token-storage";
import type { SidebarUser } from "@/shared/types/sidebar-user.types";
import { BACKOFFICE_USER_FALLBACK_NAME, BACKOFFICE_USER_LOADING_NAME } from "../constants/request-review.constants";

export function useBackofficeUser(enabled: boolean): SidebarUser {
  const { roles } = useAuth();
  const accessToken = getAccessToken();
  const { data: profile, isPending } = useQuery({
    queryKey: ["session-profile", accessToken],
    queryFn: () => profileService.getProfile(),
    enabled: enabled && Boolean(accessToken),
    retry: false,
  });

  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim();

  return {
    fullName: fullName || (enabled && isPending ? BACKOFFICE_USER_LOADING_NAME : BACKOFFICE_USER_FALLBACK_NAME),
    role: getRolesLabel(roles),
  };
}
