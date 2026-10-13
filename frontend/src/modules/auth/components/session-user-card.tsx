"use client";

import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/modules/profile";
import { SidebarUserCard } from "@/shared/components/layout/sidebar-user-card";
import { getAccessToken } from "@/shared/services/storage/access-token-storage";
import { getSessionRoleLabel } from "../utils/get-session-role-label";

export function SessionUserCard() {
  const accessToken = getAccessToken();
  const { data: profile, isPending } = useQuery({
    queryKey: ["session-profile", accessToken],
    queryFn: () => profileService.getProfile(),
    enabled: Boolean(accessToken),
    retry: false,
  });

  if (!accessToken) return null;

  const fullName = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <SidebarUserCard
      user={{
        fullName: fullName || (isPending ? "Cargando usuario…" : "Usuario"),
        role: getSessionRoleLabel(accessToken),
      }}
    />
  );
}
