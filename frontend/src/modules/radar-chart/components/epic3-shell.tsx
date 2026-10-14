"use client";

import { AppShell } from "@/shared/components/layout";
import { EPIC3_SIDEBAR_USER, RADAR_PROFILE_NAVIGATION } from "../data/radar-navigation.data";
import type { Epic3ShellProps } from "../types/epic3-shell.types";

export function Epic3Shell({ children }: Epic3ShellProps) {
  return (
    <AppShell items={RADAR_PROFILE_NAVIGATION} user={EPIC3_SIDEBAR_USER}>
      {/* Las páginas envueltas traen su propio alto y padding de pantalla completa. */}
      <div className="[&>main]:min-h-0 [&>main]:p-0">{children}</div>
    </AppShell>
  );
}
