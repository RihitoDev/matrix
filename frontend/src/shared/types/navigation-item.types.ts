import type { RoleTag } from "./role-tag.types";
import type { LucideIcon } from "lucide-react";
import type { NavigationChildItem } from "./navigation-child-item.types";

export interface NavigationItem {
  label: string;
  roles?: readonly RoleTag[];
  icon: LucideIcon;
  href?: string;
  activePathPatterns?: readonly RegExp[];
  children?: NavigationChildItem[];
}
