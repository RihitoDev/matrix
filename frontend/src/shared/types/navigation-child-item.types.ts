import type { RoleTag } from "./role-tag.types";
import type { LucideIcon } from "lucide-react";

export interface NavigationChildItem {
  label: string;
  roles?: readonly RoleTag[];
  href: string;
  icon?: LucideIcon;
  activePathPatterns?: RegExp[];
}
