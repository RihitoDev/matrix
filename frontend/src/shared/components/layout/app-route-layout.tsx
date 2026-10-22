"use client";

import type { AppRouteLayoutProps } from "@/shared/types/app-route-layout-props.types";
import { usePathname } from "next/navigation";
import { SessionGate } from "@/modules/auth";
import { getRouteRoles } from "@/shared/utils/get-route-roles";
import { RoleGate } from "./role-gate";
import { AppShell } from "./app-shell";

export function AppRouteLayout({ children }: AppRouteLayoutProps) {
  const pathname = usePathname();
  const isBackoffice = pathname === "/backoffice" || pathname?.startsWith("/backoffice/");
  const isChat = pathname === "/chat" || pathname?.startsWith("/chat/");

  if (isBackoffice) return children;

  return (
    <SessionGate>
      <AppShell
        contentClassName={isChat ? "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden" : undefined
}
      >
        <RoleGate allowedRoles={getRouteRoles(pathname ?? "")}>{children}</RoleGate>
      </AppShell>
    </SessionGate>
  );
}
