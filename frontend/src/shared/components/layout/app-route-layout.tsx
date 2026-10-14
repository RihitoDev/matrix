"use client";

import type { AppRouteLayoutProps } from "@/shared/types/app-route-layout-props.types";
import { usePathname } from "next/navigation";
import { SessionGate } from "@/modules/auth";
import { RECRUITERS_NAVIGATION } from "@/modules/recruiters";
import { AppShell } from "./app-shell";

export function AppRouteLayout({ children }: AppRouteLayoutProps) {
  const pathname = usePathname();
  const isRecruiters = pathname === "/recruiters" || pathname?.startsWith("/recruiters/");

  const isBackoffice = pathname === "/backoffice" || pathname?.startsWith("/backoffice/");
  const isChat = pathname === "/chat" || pathname?.startsWith("/chat/");

  // El layout administrativo ya incluye AppShell y valida el rol de la sesión.
  if (isBackoffice) return children;

  return (
    <SessionGate>
      <AppShell
        items={isRecruiters ? RECRUITERS_NAVIGATION : undefined}
        fullBleed={pathname === "/events"}
        contentClassName={isChat ? "flex h-[calc(100dvh-4rem)] min-h-0 flex-col" : undefined}
      >
        {children}
      </AppShell>
    </SessionGate>
  );
}
