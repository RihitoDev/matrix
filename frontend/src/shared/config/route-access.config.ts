import type { RouteAccessRule } from "@/shared/types/route-access-rule.types";

export const APP_ROUTE_ACCESS: readonly RouteAccessRule[] = [
  { pattern: /^\/backoffice(?:\/|$)/, roles: ["administrativo"] },
  { pattern: /^\/affinity-radar\/review-queue\/?$/, roles: ["administrativo"] },
  { pattern: /^\/recruiters(?:\/|$)/, roles: ["empresa"] },
  { pattern: /^\/matching\/?$/, roles: ["empresa"] },
  { pattern: /^\/area-detail(?:-interaction)?-preview\/?$/, roles: ["empresa"] },
  { pattern: /^\/profile\/radar\/?$/, roles: ["titulado", "mentor"] },
  { pattern: /^\/profile(?:\/|$)/, roles: ["titulado", "estudiante", "mentor", "empresa"] },
  { pattern: /^\/chat(?:\/|$)/, roles: ["titulado", "estudiante", "mentor", "empresa"] },
  { pattern: /^\/events(?:\/|$)/, roles: ["titulado", "mentor"] },
  { pattern: /^\/vacancies(?:\/|$)/, roles: ["titulado", "estudiante", "mentor"] },
  { pattern: /^\/mentor\/availability\/?$/, roles: ["mentor"] },
  { pattern: /^\/mentors\/participation\/technical-areas\/?$/, roles: ["mentor"] },
  { pattern: /^\/mentorship\/orientation\/?$/, roles: ["mentor"] },
  { pattern: /^\/mentors\/participation\/?$/, roles: ["titulado", "mentor"] },
  { pattern: /^\/mentors\/register\/technical-areas\/?$/, roles: ["titulado", "mentor"] },
  { pattern: /^\/mentorship\/?$/, roles: ["titulado", "mentor"] },
  { pattern: /^\/mentorship\/mentors\/?$/, roles: ["titulado", "estudiante", "mentor"] },
  { pattern: /^\/mentors\/(?!participation(?:\/|$)|register(?:\/|$))[^/]+(?:\/availability)?\/?$/, roles: ["titulado", "estudiante", "mentor"] },
];
