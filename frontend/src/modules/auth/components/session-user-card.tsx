"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profileService } from "@/modules/profile";
import { SidebarUserCard } from "@/shared/components/layout/sidebar-user-card";
import { getAccessToken } from "@/shared/services/storage/access-token-storage";
import { useAuth } from "@/shared/contexts/auth-context";
import { getRolesLabel } from "../utils/get-session-role-label";
import { endSession } from "../utils/session";

export function SessionUserCard() {
  const router = useRouter();
  const { roles } = useAuth();
  const queryClient = useQueryClient();
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

  function handleLogout() {
    endSession();
    queryClient.clear();
    router.replace("/login");
  }

  return (
    <SidebarUserCard
      user={{
        fullName: fullName || (isPending ? "Cargando usuario…" : "Usuario"),
        role: getRolesLabel(roles),
      }}
      action={(
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          onClick={handleLogout}
          className="shrink-0 text-surface/80 hover:bg-surface/10 hover:text-surface"
        >
          <LogOut strokeWidth={1.75} aria-hidden="true" />
        </Button>
      )}
    />
  );
}
