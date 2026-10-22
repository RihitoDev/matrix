import type { NavigationItem } from "@/shared/types/navigation-item.types";
import { getRouteRoles } from "@/shared/utils/get-route-roles";
import { CalendarDays, ChartNoAxesCombined, House, MessageCircle, Users, BriefcaseBusiness, Building2, Inbox, Radar } from "lucide-react";

export const SIDEBAR_NAVIGATION: NavigationItem[] = [
  { label: "Inicio", icon: House, href: "/dashboard", roles: getRouteRoles("/dashboard") },
  { label: "Mentorías", icon: Users, href: "/mentorship/mentors", activePathPatterns: [/^\/(?:mentorship|mentors|mentor)(?:\/|$)/], roles: getRouteRoles("/mentorship/mentors") },
  { label: "Talleres", icon: CalendarDays, href: "/events", roles: getRouteRoles("/events") },
  { label: "Vacantes", icon: BriefcaseBusiness, href: "/vacancies", roles: getRouteRoles("/vacancies") },
  { label: "Chat", icon: MessageCircle, href: "/chat", roles: getRouteRoles("/chat") },
  { label: "Empresas", icon: Building2, href: "/recruiters", activePathPatterns: [/^\/matching\/?$/, /^\/area-detail(?:-interaction)?-preview\/?$/], roles: getRouteRoles("/recruiters") },
  { label: "Solicitudes", icon: Inbox, href: "/backoffice/solicitudes", roles: getRouteRoles("/backoffice") },
  { label: "Revisión de radares", icon: Radar, href: "/affinity-radar/review-queue", roles: getRouteRoles("/affinity-radar/review-queue") },
  { label: "Reportes", icon: ChartNoAxesCombined, href: "/backoffice/reports/registered-users", activePathPatterns: [/^\/backoffice\/reports(?:\/|$)/], roles: getRouteRoles("/backoffice") },
];
