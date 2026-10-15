import type { BreadcrumbEntry } from "@/shared/types/breadcrumb-entry.types";

export const RECOMMENDED_JOBS_ENDPOINT = "/job-offers/recommendations";
export function getJobMatchEndpoint(jobOfferId: string): string {
  return `/job-offers/${jobOfferId}/match`;
}

export const JOBS_ROUTE = "/jobs";
export const PROFILE_SKILLS_ROUTE = "/profile/trajectory/skills";

export const JOB_MATCHING_QUERY_KEYS = {
  recommendations: ["job-matching", "recommendations"] as const,
  match: (jobOfferId: string) => ["job-matching", "match", jobOfferId] as const,
};

export const RECOMMENDED_JOBS_BREADCRUMB: BreadcrumbEntry[] = [
  { label: "UMSSY", href: "/" },
  { label: "Empleos" },
  { label: "Vacantes" },
];

export const JOB_DETAIL_BREADCRUMB: BreadcrumbEntry[] = [
  { label: "UMSSY", href: "/" },
  { label: "Empleos" },
  { label: "Vacantes", href: JOBS_ROUTE },
  { label: "Ver vacante" },
];

export const JOB_MATCHING_MESSAGES = {
  pageTitle: "Vacantes para ti",
  pageDescription: "Encuentra ofertas según las habilidades de tu perfil.",
  scoreInfoTitle: "¿Qué es la compatibilidad?",
  scoreInfoText:
    "Comparamos las habilidades de tu perfil con lo que pide cada vacante; es una guía para priorizar, no una garantía de contratación.",
  matchedLabel: "Coincide contigo",
  viewJob: "Ver vacante",
  back: "Volver",
  requirementsTitle: "Requisitos vs. tu perfil",
  descriptionTitle: "Descripción",
  scoreCaption: "de compatibilidad con tu perfil",
  noPendingRequirements: "Para esta oportunidad no tienes habilidades ni requisitos pendientes",
  loadError: "No pudimos cargar la información. Intenta nuevamente.",
  retry: "Reintentar",
  notFound: "Esta vacante ya no está disponible.",
  incompleteProfileTitle: "Aún no podemos calcular tu compatibilidad",
  incompleteProfileText:
    "No encontramos habilidades en tu perfil todavía. Complétalo para ver qué vacantes coinciden más contigo.",
  incompleteProfileAction: "Completar mi perfil",
  noMatchesTitle: "Por ahora no hay vacantes que coincidan con tu perfil",
  noMatchesText:
    "Cuando se publiquen ofertas que coincidan con tus habilidades, aparecerán aquí.",
  noMatchesAction: "Revisar mi perfil",
} as const;
