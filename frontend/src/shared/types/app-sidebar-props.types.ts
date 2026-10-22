import type { ReactNode } from "react";
import type { NavigationItem } from "./navigation-item.types";
import type { SidebarUser } from "./sidebar-user.types";

export interface AppSidebarProps {
  items?: NavigationItem[];
  user?: SidebarUser;
  brand?: ReactNode;
  footer?: ReactNode;
  itemClassName?: string;
  itemBadges?: Record<string, ReactNode>;
}
