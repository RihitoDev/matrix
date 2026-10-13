import { Dot } from "lucide-react";
import type { NavigationItem } from "@/shared/types/navigation-item.types";
import { CalendarClock, CalendarDays, House, ListChecks, User, UserRound } from "lucide-react";

export const SIDEBAR_NAVIGATION: NavigationItem[] = [
  { label: "Mis vacantes", icon: Dot, href: "#" },
  { label: "Registrar nueva vacante", icon: Dot, href: "/vacancies/register" },
  { label: "Perfil de empresa", icon: Dot, href: "#" },
  { label: "Inicio", icon: House, href: "/" },
  { label: "Mi perfil", icon: User, href: "/profile" },
  {
    label: "Mentorías",
    icon: CalendarDays,
    children: [
      {
        label: "Directorio de mentorías",
        href: "/mentorship/mentors",
        icon: ListChecks,
        activePathPatterns: [/^\/mentors\/(?!participation(?:\/|$))[^/]+\/?$/],
      },
      {
        label: "Mi participación",
        href: "/mentors/participation",
        icon: UserRound,
      },
      {
        label: "Mi disponibilidad",
        href: "/mentor/availability",
        icon: CalendarClock,
      },
    ],
  },
];
