"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

export function SidebarToggleButton() {
  const { open, toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label={open ? "Cerrar menú" : "Abrir menú"}
      aria-expanded={open}
      className="rounded-md p-2 text-ink-soft transition-colors hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Menu className="size-5" aria-hidden="true" />
    </button>
  );
}
