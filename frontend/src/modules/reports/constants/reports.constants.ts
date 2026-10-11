import type { BreadcrumbEntry } from "@/shared/types/breadcrumb-entry.types";

export const REGISTERED_USERS_PAGE_SIZE = 10;
export const REJECTED_USERS_PAGE_SIZE = 10;
export const REPORT_HISTORY_PAGE_SIZE = 10;

export const SEARCH_DEBOUNCE_MS = 300;

export const REGISTERED_USERS_CSV_FALLBACK_NAME = "usuarios-registrados.csv";
export const REJECTED_USERS_CSV_FALLBACK_NAME = "usuarios-rechazados.csv";

export const ACADEMIC_PERIODS = ["I-2026", "II-2026", "I-2025", "II-2025"];

export const REGISTERED_USERS_BREADCRUMB: BreadcrumbEntry[] = [
  { label: "Inicio", href: "/dashboard" },
  { label: "Reportes Analíticos" },
  { label: "Reporte de usuarios registrados" },
];

export const REJECTED_USERS_BREADCRUMB: BreadcrumbEntry[] = [
  { label: "Inicio", href: "/dashboard" },
  { label: "Reportes Analíticos" },
  { label: "Reporte de usuarios rechazados" },
];

export const REPORT_HISTORY_BREADCRUMB: BreadcrumbEntry[] = [
  { label: "Inicio", href: "/dashboard" },
  { label: "Reportes Analíticos" },
  { label: "Historial de reportes generados" },
];
