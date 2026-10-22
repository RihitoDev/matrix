"use client";

import { useMemo } from "react";
import { AppShell } from "@/shared/components/layout";
import { useBackofficeSession } from "../../hooks/use-backoffice-session";
import { useBackofficeUser } from "../../hooks/use-backoffice-user";
import { useStatusCounts } from "../../hooks/use-status-counts";
import type { ReviewStatus } from "../../types/request-review.types";
import { BackofficeBrand } from "./backoffice-brand";
import { BackofficeSessionSkeleton } from "./backoffice-session-skeleton";
import { BackofficeUserFooter } from "./backoffice-user-footer";
import type { BackofficeShellProps } from "../../types/backoffice-shell-props.types";

const PENDING_ONLY: readonly ReviewStatus[] = ["pending"];
const NONE: readonly ReviewStatus[] = [];

export function BackofficeShell({ children }: BackofficeShellProps) {
  const { state, logout } = useBackofficeSession();
  const user = useBackofficeUser(state === "allowed");
  // El conteo de pendientes solo se pide con sesión de administrativo
  const counts = useStatusCounts(state === "allowed" ? PENDING_ONLY : NONE);

  const badges = useMemo(() => {
    const pending = counts.pending;
    if (typeof pending !== "number") return undefined;
    return {
      Solicitudes: (
        <span
          aria-label={`${pending} pendientes`}
          className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-surface"
        >
          {pending}
        </span>
      ),
    };
  }, [counts.pending]);

  return (
    <AppShell
      brand={<BackofficeBrand />}
      sidebarFooter={<BackofficeUserFooter user={user} onLogout={logout} />}
      sidebarItemBadges={badges}
      sidebarWidth="16.5rem"
    >
      {state === "allowed" ? children : <BackofficeSessionSkeleton />}
    </AppShell>
  );
}
