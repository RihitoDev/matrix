import {
  ClipboardList,
  MousePointerClick,
  PanelBottom,
  Search,
  User,
} from "lucide-react";
import type { NavigationItem } from "@/shared/types/navigation-item.types";
import type { SidebarUser } from "@/shared/types/sidebar-user.types";
import { RADAR_PROFILE } from "./radar-profile.data";

export const RADAR_PROFILE_PATH = "/perfil/radar";
export const REVIEW_QUEUE_PATH = "/affinity-radar/review-queue";
export const MATCHING_PATH = "/matching";
export const AREA_DETAIL_INTERACTION_PATH = "/area-detail-interaction-preview";
export const AREA_DETAIL_PANEL_PATH = "/area-detail-preview";

export const RADAR_PROFILE_NAVIGATION: NavigationItem[] = [
  { label: "Mi Perfil", icon: User, href: RADAR_PROFILE_PATH },
  { label: "Cola de revisión", icon: ClipboardList, href: REVIEW_QUEUE_PATH },
  { label: "Matching", icon: Search, href: MATCHING_PATH },
  {
    label: "Detalle por área",
    icon: MousePointerClick,
    href: AREA_DETAIL_INTERACTION_PATH,
  },
  { label: "Panel de detalle", icon: PanelBottom, href: AREA_DETAIL_PANEL_PATH },
];

export const EPIC3_SIDEBAR_USER: SidebarUser = {
  fullName: RADAR_PROFILE.name,
  role: "Egresado",
};
