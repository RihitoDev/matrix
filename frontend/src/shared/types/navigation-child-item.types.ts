import type { LucideIcon } from "lucide-react";

export interface NavigationChildItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  activePathPatterns?: RegExp[];
}
