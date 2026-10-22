"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/shared/contexts/auth-context";
import { SidebarToggleButton } from "./sidebar-toggle-button";
import { NavigationSearch } from "./navigation-search";
import { AccountMenu } from "./account-menu";
import { WorkspaceSectionMenu } from "./workspace-section-menu";

export function AppHeader() {
  const pathname = usePathname() ?? "";
  const { roles } = useAuth();
  return (
    <header className="flex min-h-16 shrink-0 items-center justify-between gap-6 border-b border-border bg-surface px-6">
      <nav aria-label="Navegación del área" className="flex min-w-0 items-center gap-3">
        <SidebarToggleButton />
        <span aria-hidden="true" className="h-5 w-px bg-border" />
        <WorkspaceSectionMenu pathname={pathname} roles={roles} />
      </nav>
      <div className="flex shrink-0 items-center gap-4">
        <NavigationSearch />
        <AccountMenu roles={roles} />
      </div>
    </header>
  );
}
