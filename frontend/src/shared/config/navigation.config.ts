import type { NavigationItem } from "@/shared/types/navigation-item.types";
import { RECRUITERS_ROUTES } from "@/modules/recruiters";
import { ROLE_TAGS } from "@/shared/constants/roles.constants";
import { REPORTS_NAVIGATION_ITEM } from "@/modules/reports";
import {
  CalendarClock,
  CalendarDays,
  House,
  ListChecks,
  MessageCircle,
  Ticket,
  User,
  UserRound,
  BriefcaseBusiness,
  Building2,
  Inbox,
  SquarePlus,
} from "lucide-react";

export const SIDEBAR_NAVIGATION: NavigationItem[] = [
  { label: "Mi perfil", icon: User, href: "/profile", roles: ROLE_TAGS },
  { label: "Chat", icon: MessageCircle, href: "/chat", roles: ["titulado", "estudiante", "mentor", "empresa"] },
  {
    label: "Mentorías",
    icon: CalendarDays,
    children: [
      {
        label: "Directorio de mentorías",
        href: "/mentorship/mentors",
        icon: ListChecks,
        roles: ["titulado", "estudiante", "mentor"],
        activePathPatterns: [/^\/mentors\/(?!participation(?:\/|$))[^/]+\/?$/],
      },
      {
        label: "Mi participación",
        href: "/mentors/participation",
        icon: UserRound,
        roles: ["titulado", "mentor"],
      },
      {
        label: "Mi disponibilidad",
        href: "/mentor/availability",
        icon: CalendarClock,
        roles: ["mentor"],
      },
    ],
  },
  {
    label: "Talleres",
    icon: CalendarDays,
    roles: ["titulado", "estudiante", "mentor"],
    children: [
      { label: "Talleres disponibles", href: "/events", icon: ListChecks },
      { label: "Mis inscripciones", href: "/events/my-passes", icon: Ticket },
    ],
  },
  {
    label: "Vacantes",
    icon: BriefcaseBusiness,
    href: "/vacancies",
    roles: ["titulado", "estudiante", "mentor"],
  },
  {
    label: "Reclutadores",
    icon: Building2,
    roles: ["empresa"],
    children: [
      { label: "Portal de empresa", icon: House, href: RECRUITERS_ROUTES.home },
      {
        label: "Registrar nueva vacante",
        icon: SquarePlus,
        href: RECRUITERS_ROUTES.newJobOffer,
      },
    ],
  },
  {
    label: "Solicitudes",
    icon: Inbox,
    href: "/backoffice/solicitudes",
    roles: ["administrativo"],
  },
  { ...REPORTS_NAVIGATION_ITEM, roles: ["administrativo"] },
];
