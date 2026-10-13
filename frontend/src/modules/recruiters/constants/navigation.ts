import { BriefcaseBusiness, Building2, House, SquarePlus } from "lucide-react";
import type { NavigationItem } from "@/shared/types/navigation-item.types";

export const RECRUITERS_ROUTES = {
  home: "/recruiters",
  newJobOffer: "/recruiters/job-offers/new",
} as const;

export const RECRUITERS_NAVIGATION: NavigationItem[] = [
  { label: "Inicio", icon: House, href: RECRUITERS_ROUTES.home },
  { label: "Mis vacantes", icon: BriefcaseBusiness },
  { label: "Registrar nueva vacante", icon: SquarePlus, href: RECRUITERS_ROUTES.newJobOffer },
  { label: "Perfil de empresa", icon: Building2 },
];
