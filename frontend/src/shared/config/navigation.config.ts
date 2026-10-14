import type { NavigationItem } from "@/shared/types/navigation-item.types";
import { CalendarClock, CalendarDays, ChartNoAxesCombined, House, ListChecks, Search, Ticket, User, UserRound } from "lucide-react";

export const SIDEBAR_NAVIGATION: NavigationItem[] = [
  { label: "Inicio", icon: House, href: "/" },
  { label: "Mi perfil", icon: User, href: "/profile" },
  { label: "Radar de afinidad", icon: ChartNoAxesCombined, href: "/perfil/radar" },
  { label: "Matching", icon: Search, href: "/matching" },
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
  {
    label: "Talleres",
    icon: CalendarDays,
    children: [
      { label: "Talleres disponibles", href: "/events", icon: ListChecks },
      { label: "Mis inscripciones", href: "/events/my-passes", icon: Ticket },
    ],
  },
];
