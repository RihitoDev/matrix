import type { SidebarUser } from "./sidebar-user.types";
import type { ReactNode } from "react";

export interface SidebarUserCardProps {
  user: SidebarUser;
  action?: ReactNode;
}
