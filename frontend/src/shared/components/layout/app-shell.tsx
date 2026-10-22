"use client";

import type { CSSProperties } from "react";
import { cn } from "cn";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SIDEBAR_STYLE } from "@/shared/constants/sidebar.constants";
import type { AppShellProps } from "@/shared/types/app-shell-props.types";
import type { NavigationItem } from "@/shared/types/navigation-item.types";
import { AppSidebar } from "./app-sidebar";
import { SessionUserCard } from "@/modules/auth";
import { getAccessToken } from "@/shared/services/storage/access-token-storage";
import { AppHeader } from "./app-header";

export function AppShell({
  children,
  items,
  user,
  fullBleed = false,
  brand,
  sidebarFooter,
  sidebarItemClassName,
  sidebarItemBadges,
  sidebarWidth,
  header,
  contentClassName,
}: AppShellProps) {
  return (
    <SidebarProvider
      style={
        sidebarWidth
          ? ({
              ...SIDEBAR_STYLE,
              "--sidebar-width": sidebarWidth,
            } as CSSProperties)
          : SIDEBAR_STYLE
      }
    >
      <AppSidebar
        items={items as NavigationItem[] | undefined}
        user={user}
        brand={brand}
        footer={
          sidebarFooter ??
          (!user && getAccessToken() ? <SessionUserCard /> : undefined)
        }
        itemClassName={sidebarItemClassName}
        itemBadges={sidebarItemBadges}
      />
      <SidebarInset
        className={cn(
          "min-w-0 bg-surface-soft",
          contentClassName && "h-dvh min-h-0 overflow-hidden",
        )}
      >
        {header ?? <AppHeader />}
        <div
          className={cn(
            "flex-1",
            contentClassName ??
              (fullBleed ? "flex min-w-0 flex-col" : "px-8 py-8"),
          )}
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
