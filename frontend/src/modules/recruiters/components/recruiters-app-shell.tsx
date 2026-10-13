"use client";

import { AppShell } from "@/shared/components/layout";
import { RECRUITERS_NAVIGATION } from "../constants/navigation";
import type { RecruitersAppShellProps } from "../types/recruiters-app-shell-props.types";

export function RecruitersAppShell({ children }: RecruitersAppShellProps) {
  return <AppShell items={RECRUITERS_NAVIGATION}>{children}</AppShell>;
}
