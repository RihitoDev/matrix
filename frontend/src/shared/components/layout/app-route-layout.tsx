"use client";

import type { AppRouteLayoutProps } from "@/shared/types/app-route-layout-props.types";
import { usePathname } from "next/navigation";
import { SessionGate } from "@/modules/auth";
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
        fullBleed={pathname === "/events"}
        contentClassName={isChat ? "flex h-[calc(100dvh-4rem)] min-h-0 flex-col" : undefined}
      >
        {isChat ? <RoleGate allowedRoles={["titulado", "estudiante", "mentor", "empresa"]}>{children}</RoleGate> : children}
      </AppShell>
    </SessionGate>
  );
}
