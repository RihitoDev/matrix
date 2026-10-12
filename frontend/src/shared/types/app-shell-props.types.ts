import type { ReactNode } from "react";
import type { NavigationItem } from "./navigation-item.types";
import type { SidebarUser } from "./sidebar-user.types";

export interface AppShellProps {
  children: ReactNode;
  items?: NavigationItem[];
  user?: SidebarUser;
  fullBleed?: boolean;
}
