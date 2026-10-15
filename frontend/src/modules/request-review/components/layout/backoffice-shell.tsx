"use client";

import { useMemo } from "react";
import { AppShell } from "@/shared/components/layout";
import { SidebarToggleButton } from "@/shared/components/layout/sidebar-toggle-button";
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

// Ítem activo con fondo tenue y barra roja en el borde izquierdo (sin el fondo rojo por defecto)
const ITEM_CLASS =
  "overflow-visible data-active:bg-surface/10 data-active:before:-left-3 data-active:before:w-1 data-active:before:bg-accent";

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
      sidebarItemClassName={ITEM_CLASS}
      sidebarItemBadges={badges}
      sidebarWidth="15.5rem"
      header={
        <div className="px-4 py-2 md:hidden">
          <SidebarToggleButton />
        </div>
      }
      contentClassName=""
    >
      {state === "allowed" ? children : <BackofficeSessionSkeleton />}
    </AppShell>
  );
}
