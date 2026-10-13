"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { EventsAppShell } from "@/modules/events";
import { AppShell } from "@/shared/components/layout";

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/events" || pathname?.startsWith("/events/")) {
    return <EventsAppShell>{children}</EventsAppShell>;
  }
  return <AppShell>{children}</AppShell>;
}
