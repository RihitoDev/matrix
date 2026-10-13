import type { NavigationItem } from "@/shared/types/navigation-item.types";
import {
  CalendarClock,
  CalendarDays,
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
      {
        label: "Mi disponibilidad",
        href: "/mentor/availability",
        icon: CalendarClock,
      },
    ],
  },
];
