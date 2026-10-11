
import type { NavigationItem } from "@/shared/types/navigation-item.types";
import {
  CalendarDays,
  ChartColumn,
  House,
  ListChecks,
  MessageCircle,
  User,
  UserRound,
} from "lucide-react";

export const SIDEBAR_NAVIGATION: NavigationItem[] = [
  { label: "Inicio", icon: House, href: "/" },
  { label: "Mi perfil", icon: User, href: "/profile" },
  { label: "Chat", icon: MessageCircle, href: "/chat" },
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
    ],
  },
  {
    label: "Reportes Analíticos",
    icon: ChartColumn,
    children: [
      { label: "Reporte de usuarios registrados", href: "/reports/registered-users" },
      { label: "Reporte de usuarios rechazados", href: "/reports/rejected-users" },
      { label: "Historial de reportes generados", href: "/reports/history" },
    ],
  },
];
