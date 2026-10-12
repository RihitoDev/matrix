"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SessionGate } from "@/modules/auth";
import { EventsAppShell } from "@/modules/events";
import { AppShell } from "@/shared/components/layout";

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isEvents = pathname === "/events" || pathname?.startsWith("/events/");
  return <SessionGate>{isEvents ? <EventsAppShell>{children}</EventsAppShell> : <AppShell>{children}</AppShell>}</SessionGate>;
}
