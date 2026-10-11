import type { ProfileTab } from "../types/profile-tab.types";

export const PROFILE_TABS: ProfileTab[] = [
  {
    id: "personal-info",
    label: "Datos personales",
    href: "/profile/personal-info",
    isAvailable: true,
  },
  {
    id: "presentation",
    label: "Presentación",
    href: "/profile/presentation",
    isAvailable: true,
  },
  {
    id: "trajectory",
    label: "Trayectoria",
    href: "/profile/trajectory/education",
    isAvailable: true,
  },
  {
    id: "documents",
    label: "Documentos",
    href: "/profile/documents",
    isAvailable: true,
  },
];
