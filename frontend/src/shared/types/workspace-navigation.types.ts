import type { LucideIcon } from "lucide-react";

export type WorkspaceAreaId = "profile" | "community" | "opportunities" | "company" | "management";

export interface WorkspaceTask {
  label: string;
  href: string;
  icon: LucideIcon;
  area: WorkspaceAreaId;
  keywords?: string;
}

export interface WorkspaceArea {
  id: WorkspaceAreaId;
  label: string;
  icon: LucideIcon;
}
