import type { LucideIcon } from "lucide-react";
import type { RoleTag } from "./role-tag.types";

export interface WorkspaceSectionItemProps {
  label: string;
  href: string;
  group?: string;
}

export interface WorkspaceSectionProps {
  id: string;
  label: string;
  icon: LucideIcon;
  patterns: readonly RegExp[];
  items: readonly WorkspaceSectionItemProps[];
}

export interface WorkspaceSectionMenuProps {
  pathname: string;
  roles: readonly RoleTag[];
}
