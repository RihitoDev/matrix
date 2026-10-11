"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { SIDEBAR_NAVIGATION } from "@/shared/config/navigation.config";
import type { AppSidebarProps } from "@/shared/types/app-sidebar-props.types";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarNavItem } from "./sidebar-nav-item";
import { SidebarUserCard } from "./sidebar-user-card";

// Props opcionales para personalizar la barra (marca, pie, estilo de ítems e insignias por etiqueta).
// Sin ellas el render es idéntico al anterior.
interface AppSidebarExtras {
  brand?: ReactNode;
  footer?: ReactNode;
  itemClassName?: string;
  itemBadges?: Record<string, ReactNode>;
}

export function AppSidebar({
  items = SIDEBAR_NAVIGATION,
  user,
  brand,
  footer,
  itemClassName,
  itemBadges,
}: AppSidebarProps & AppSidebarExtras) {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-ink bg-ink text-surface *:data-[slot=sidebar-inner]:bg-ink"
    >
      <SidebarHeader className="p-2">
        {brand ?? <SidebarBrand />}
      </SidebarHeader>

      <SidebarContent className="px-3">
        <nav aria-label="Menú principal">
          <SidebarMenu className="gap-1">
            {items.map((item) => (
              <SidebarNavItem
                key={item.label}
                item={item}
                pathname={pathname}
                className={itemClassName}
                badge={itemBadges?.[item.label]}
              />
            ))}
          </SidebarMenu>
        </nav>
      </SidebarContent>

      {footer ? (
        <SidebarFooter className="px-3 py-4">{footer}</SidebarFooter>
      ) : (
        user && (
          <SidebarFooter className="px-3 py-4">
            <SidebarUserCard user={user} />
          </SidebarFooter>
        )
      )}
    </Sidebar>
  );
}
