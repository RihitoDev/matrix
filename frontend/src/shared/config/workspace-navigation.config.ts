import { BookOpen, BriefcaseBusiness, Building2, CalendarClock, FileText, GraduationCap, Inbox, ListChecks, MessageCircle, Radar, Search, ShieldCheck, Sparkles, SquarePlus, Ticket, UserRound, Users, Award } from "lucide-react";
import type { WorkspaceArea, WorkspaceTask } from "@/shared/types/workspace-navigation.types";

export const WORKSPACE_AREAS: readonly WorkspaceArea[] = [
  { id: "management", label: "Administración", icon: ShieldCheck },
  { id: "company", label: "Mi empresa", icon: Building2 },
  { id: "profile", label: "Mi perfil", icon: UserRound },
  { id: "community", label: "Comunidad", icon: Users },
  { id: "opportunities", label: "Oportunidades", icon: BriefcaseBusiness },
];

export const WORKSPACE_TASKS: readonly WorkspaceTask[] = [
  { label: "Solicitudes de acceso", href: "/backoffice/solicitudes", icon: Inbox, area: "management", keywords: "aprobar rechazar documentos pendientes" },
  { label: "Usuarios registrados", href: "/backoffice/reports/registered-users", icon: ListChecks, area: "management", keywords: "reporte exportar csv" },
  { label: "Usuarios rechazados", href: "/backoffice/reports/rejected-users", icon: FileText, area: "management", keywords: "reporte motivos" },
  { label: "Historial de reportes", href: "/backoffice/reports/history", icon: CalendarClock, area: "management" },
  { label: "Revisión de radares", href: "/affinity-radar/review-queue", icon: Radar, area: "management" },
  { label: "Portal de empresa", href: "/recruiters", icon: Building2, area: "company" },
  { label: "Publicar vacante", href: "/recruiters/job-offers/new", icon: SquarePlus, area: "company", keywords: "empleo oferta trabajo" },
  { label: "Buscar candidatos", href: "/matching", icon: Search, area: "company", keywords: "afinidad reclutamiento" },
  { label: "Resumen del perfil", href: "/profile", icon: UserRound, area: "profile" },
  { label: "Datos personales", href: "/profile/personal-info", icon: UserRound, area: "profile", keywords: "contacto teléfono ciudad correo foto" },
  { label: "Presentación", href: "/profile/presentation", icon: FileText, area: "profile", keywords: "biografía sobre mí titular" },
  { label: "Formación académica", href: "/profile/trajectory/education", icon: GraduationCap, area: "profile", keywords: "estudios trayectoria universidad" },
  { label: "Experiencia laboral", href: "/profile/trajectory/experience", icon: BriefcaseBusiness, area: "profile", keywords: "trabajo trayectoria" },
  { label: "Habilidades", href: "/profile/trajectory/skills", icon: Sparkles, area: "profile", keywords: "competencias tecnologías" },
  { label: "Certificaciones", href: "/profile/trajectory/certifications", icon: Award, area: "profile", keywords: "diplomas certificados" },
  { label: "Documentos y CV", href: "/profile/documents", icon: FileText, area: "profile", keywords: "currículum curriculum archivo" },
  { label: "Encontrar un mentor", href: "/mentorship/mentors", icon: Users, area: "community", keywords: "directorio orientación" },
  { label: "Mi participación", href: "/mentors/participation", icon: UserRound, area: "community", keywords: "ser mentor áreas técnicas orientación" },
  { label: "Mi disponibilidad", href: "/mentor/availability", icon: CalendarClock, area: "community", keywords: "horarios bloques calendario" },
  { label: "Chat", href: "/chat", icon: MessageCircle, area: "community", keywords: "mensajes conversaciones" },
  { label: "Talleres disponibles", href: "/events", icon: BookOpen, area: "opportunities", keywords: "eventos actividades formación" },
  { label: "Mis inscripciones", href: "/events/my-passes", icon: Ticket, area: "opportunities", keywords: "pases talleres entradas" },
  { label: "Vacantes", href: "/vacancies", icon: BriefcaseBusiness, area: "opportunities", keywords: "empleo trabajo ofertas" },
  { label: "Radar de afinidad", href: "/profile/radar", icon: Radar, area: "opportunities", keywords: "competencias perfil" },
];
