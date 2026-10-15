import type { NavigationItem } from "@/shared/types/navigation-item.types";
import { RECRUITERS_ROUTES } from "@/modules/recruiters";
import { getRouteRoles } from "@/shared/utils/get-route-roles";
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
  Radar,
  Search,
} from "lucide-react";

export const SIDEBAR_NAVIGATION: NavigationItem[] = [
  {
    label: "Mi perfil",
    icon: User,
    children: [
      { label: "Resumen del perfil", icon: User, href: "/profile", roles: getRouteRoles("/profile") },
      { label: "Radar de afinidad", icon: Radar, href: "/profile/radar", roles: getRouteRoles("/profile/radar") },
    ],
  },
  { label: "Chat", icon: MessageCircle, href: "/chat", roles: getRouteRoles("/chat") },
  {
    label: "Mentorías",
    icon: CalendarDays,
    children: [
      {
        label: "Directorio de mentorías",
        href: "/mentorship/mentors",
        icon: ListChecks,
        roles: getRouteRoles("/mentorship/mentors"),
        activePathPatterns: [/^\/mentors\/(?!participation(?:\/|$)|register(?:\/|$))[^/]+(?:\/availability)?\/?$/],
      },
      {
        label: "Mi participación",
        href: "/mentors/participation",
        icon: UserRound,
        roles: getRouteRoles("/mentors/participation"),
        activePathPatterns: [/^\/mentorship(?:\/orientation)?\/?$/, /^\/mentors\/register\/technical-areas\/?$/],
      },
      {
        label: "Mi disponibilidad",
        href: "/mentor/availability",
        icon: CalendarClock,
        roles: getRouteRoles("/mentor/availability"),
      },
    ],
  },
  {
    label: "Talleres",
    icon: CalendarDays,
    roles: getRouteRoles("/events"),
    children: [
      { label: "Talleres disponibles", href: "/events", icon: ListChecks },
      { label: "Mis inscripciones", href: "/events/my-passes", icon: Ticket },
    ],
  },
  {
    label: "Vacantes",
    icon: BriefcaseBusiness,
    href: "/vacancies",
    roles: getRouteRoles("/vacancies"),
  },
  {
    label: "Reclutadores",
    icon: Building2,
    roles: getRouteRoles("/recruiters"),
    children: [
      { label: "Buscar candidatos", icon: Search, href: "/matching", activePathPatterns: [/^\/area-detail(?:-interaction)?-preview\/?$/] },
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
    roles: getRouteRoles("/backoffice"),
  },
  { label: "Revisión de radares", icon: Radar, href: "/affinity-radar/review-queue", roles: getRouteRoles("/affinity-radar/review-queue") },
  { ...REPORTS_NAVIGATION_ITEM, roles: getRouteRoles("/backoffice") },
];
