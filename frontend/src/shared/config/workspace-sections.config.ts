import { BriefcaseBusiness, Building2, CalendarDays, ChartNoAxesCombined, House, Inbox, MessageCircle, Radar, UserRound, Users } from "lucide-react";
import type { WorkspaceSectionProps } from "@/shared/types/workspace-section-props.types";

export const WORKSPACE_SECTIONS: readonly WorkspaceSectionProps[] = [
  {
    id: "profile", label: "Perfil profesional", icon: UserRound, patterns: [/^\/profile(?:\/|$)/],
    items: [
      { label: "Resumen", href: "/profile", group: "Perfil" },
      { label: "Datos personales", href: "/profile/personal-info", group: "Perfil" },
      { label: "Presentación", href: "/profile/presentation", group: "Perfil" },
      { label: "Formación académica", href: "/profile/trajectory/education", group: "Trayectoria" },
      { label: "Experiencia laboral", href: "/profile/trajectory/experience", group: "Trayectoria" },
      { label: "Habilidades", href: "/profile/trajectory/skills", group: "Trayectoria" },
      { label: "Certificaciones", href: "/profile/trajectory/certifications", group: "Trayectoria" },
      { label: "Documentos y CV", href: "/profile/documents", group: "Documentos y afinidad" },
      { label: "Radar de afinidad", href: "/profile/radar", group: "Documentos y afinidad" },
    ],
  },
  {
    id: "mentorship", label: "Mentorías", icon: Users, patterns: [/^\/(?:mentorship|mentors|mentor)(?:\/|$)/],
    items: [
      { label: "Encontrar mentores", href: "/mentorship/mentors" },
      { label: "Mi participación", href: "/mentors/participation" },
      { label: "Áreas técnicas", href: "/mentors/participation/technical-areas" },
      { label: "Tipos de orientación", href: "/mentorship/orientation" },
      { label: "Mi disponibilidad", href: "/mentor/availability" },
    ],
  },
  {
    id: "events", label: "Talleres", icon: CalendarDays, patterns: [/^\/events(?:\/|$)/],
    items: [
      { label: "Explorar talleres", href: "/events" },
      { label: "Mis inscripciones", href: "/events/my-passes" },
    ],
  },
  {
    id: "company", label: "Empresas", icon: Building2, patterns: [/^\/(?:recruiters|matching)(?:\/|$)/, /^\/area-detail(?:-interaction)?-preview\/?$/],
    items: [
      { label: "Portal de empresa", href: "/recruiters" },
      { label: "Publicar vacante", href: "/recruiters/job-offers/new" },
      { label: "Buscar candidatos", href: "/matching" },
    ],
  },
  {
    id: "reports", label: "Reportes", icon: ChartNoAxesCombined, patterns: [/^\/backoffice\/reports(?:\/|$)/],
    items: [
      { label: "Usuarios aceptados", href: "/backoffice/reports/registered-users" },
      { label: "Usuarios rechazados", href: "/backoffice/reports/rejected-users" },
      { label: "Historial de reportes", href: "/backoffice/reports/history" },
    ],
  },
  { id: "requests", label: "Solicitudes", icon: Inbox, patterns: [/^\/backoffice(?:\/|$)/], items: [] },
  { id: "radar-review", label: "Revisión de radares", icon: Radar, patterns: [/^\/affinity-radar\/review-queue\/?$/], items: [] },
  { id: "vacancies", label: "Vacantes", icon: BriefcaseBusiness, patterns: [/^\/vacancies(?:\/|$)/], items: [] },
  { id: "chat", label: "Chat", icon: MessageCircle, patterns: [/^\/chat(?:\/|$)/], items: [] },
  { id: "home", label: "Inicio", icon: House, patterns: [/^\/dashboard\/?$/], items: [] },
];
