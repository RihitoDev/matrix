import type { SidebarUser } from "@/shared/types/sidebar-user.types";

export interface BackofficeUserFooterProps {
  user: SidebarUser;
  onLogout: () => void;
}
