"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "cn";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { SIDEBAR_ITEM_CLASS, SIDEBAR_SUB_ITEM_CLASS } from "@/shared/constants/sidebar.constants";
import type { SidebarNavItemProps } from "@/shared/types/sidebar-nav-item-props.types";
import { isRouteActive } from "@/shared/utils/is-route-active";

// className y badge son opcionales: sin ellos el render es el de siempre
export function SidebarNavItem({
  item,
  pathname,
  className,
  badge,
}: SidebarNavItemProps & { className?: string; badge?: ReactNode }) {
  const Icon = item.icon;
  const submenuId = useId();
  const hasActiveChild =
    item.children?.some((child) =>
      isRouteActive(pathname, child.href, child.activePathPatterns),
    ) ?? false;
  const [isExpanded, setIsExpanded] = useState(hasActiveChild);

  if (!item.children) {
    const isActive = item.href ? isRouteActive(pathname, item.href) : false;

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          render={<Link href={item.href ?? "#"} />}
          isActive={isActive}
          aria-current={isActive ? "page" : undefined}
          className={cn(SIDEBAR_ITEM_CLASS, className)}
        >
          <Icon strokeWidth={1.5} aria-hidden="true" />
          <span className={badge ? "flex-1" : undefined}>{item.label}</span>
          {badge}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem className={hasActiveChild ? "rounded-md bg-surface/5" : undefined}>
      <SidebarMenuButton
        isActive={hasActiveChild}
        aria-expanded={isExpanded}
        aria-controls={submenuId}
        onClick={() => setIsExpanded((previous) => !previous)}
        className={SIDEBAR_ITEM_CLASS}
      >
        <Icon strokeWidth={1.5} aria-hidden="true" />
        <span className="flex-1">{item.label}</span>
        <ChevronDown
          className={`text-accent transition-transform ${isExpanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </SidebarMenuButton>

      {isExpanded && (
        <SidebarMenuSub id={submenuId} className="mx-0 border-l-0 py-2 pl-6 pr-2">
          {item.children.map((child) => {
            const isChildActive = isRouteActive(
              pathname,
              child.href,
              child.activePathPatterns,
            );
            const ChildIcon = child.icon;

            return (
              <SidebarMenuSubItem key={child.href}>
                <SidebarMenuSubButton
                  render={<Link href={child.href} />}
                  isActive={isChildActive}
                  aria-current={isChildActive ? "page" : undefined}
                  className={SIDEBAR_SUB_ITEM_CLASS}
                >
                  {ChildIcon ? (
                    <ChildIcon size={16} strokeWidth={1.75} aria-hidden="true" />
                  ) : (
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${isChildActive ? "bg-accent" : "bg-surface/40"}`}
                      aria-hidden="true"
                    />
                  )}
                  <span>{child.label}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}
