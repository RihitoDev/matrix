"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SessionGate } from "@/modules/auth";
import { EventsAppShell } from "@/modules/events";
import { RecruitersAppShell } from "@/modules/recruiters";
import { AppShell } from "@/shared/components/layout";

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isEvents = pathname === "/events" || pathname?.startsWith("/events/");
  const isRecruiters = pathname === "/recruiters" || pathname?.startsWith("/recruiters/");
  if (isRecruiters) return <SessionGate><RecruitersAppShell>{children}</RecruitersAppShell></SessionGate>;
  return <SessionGate>{isEvents ? <EventsAppShell>{children}</EventsAppShell> : <AppShell>{children}</AppShell>}</SessionGate>;
}
