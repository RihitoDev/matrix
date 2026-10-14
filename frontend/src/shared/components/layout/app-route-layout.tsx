"use client";

import type { AppRouteLayoutProps } from "@/shared/types/app-route-layout-props.types";
import { usePathname } from "next/navigation";
import { SessionGate } from "@/modules/auth";
import { AppShell } from "./app-shell";

export function AppRouteLayout({ children }: AppRouteLayoutProps) {
  const pathname = usePathname();
  const isBackoffice = pathname === "/backoffice" || pathname?.startsWith("/backoffice/");
  const isChat = pathname === "/chat" || pathname?.startsWith("/chat/");

  // El layout administrativo ya incluye AppShell y valida el rol de la sesión.
  if (isBackoffice) return children;

  return (
    <SessionGate>
      <AppShell
        fullBleed={pathname === "/events"}
        contentClassName={isChat ? "flex h-[calc(100dvh-4rem)] min-h-0 flex-col" : undefined}
      >
        {children}
      </AppShell>
    </SessionGate>
  );
}
