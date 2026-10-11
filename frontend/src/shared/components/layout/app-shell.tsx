"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "cn";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SIDEBAR_STYLE } from "@/shared/constants/sidebar.constants";
import type { AppShellProps } from "@/shared/types/app-shell-props.types";
import type { NavigationItem } from "@/shared/types/navigation-item.types";
import { AppSidebar } from "./app-sidebar";
import { SidebarToggleButton } from "./sidebar-toggle-button";

// Props opcionales: sin ellas el render es idéntico al anterior
interface AppShellExtras {
  brand?: ReactNode;
  sidebarFooter?: ReactNode;
  sidebarItemClassName?: string;
  sidebarItemBadges?: Record<string, ReactNode>;
  sidebarWidth?: string;
  // Reemplaza la cabecera por defecto (que lleva el botón de menú)
  header?: ReactNode;
  contentClassName?: string;
}

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
}: AppShellProps & AppShellExtras) {
  return (
    <SidebarProvider style={sidebarWidth ? ({ ...SIDEBAR_STYLE, "--sidebar-width": sidebarWidth } as CSSProperties) : SIDEBAR_STYLE}>
      <AppSidebar
        items={items as NavigationItem[] | undefined}
        user={user}
        brand={brand}
        footer={sidebarFooter}
        itemClassName={sidebarItemClassName}
        itemBadges={sidebarItemBadges}
      />
      <SidebarInset className="bg-surface-soft">
        {header ?? (
          <header className={fullBleed ? "absolute left-4 top-3 z-10 flex items-center" : "flex items-center px-4 py-3"}>
            <SidebarToggleButton />
          </header>
        )}
        <div className={cn("flex-1", contentClassName ?? (fullBleed ? "flex min-w-0 flex-col" : "px-8 pb-8"))}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
