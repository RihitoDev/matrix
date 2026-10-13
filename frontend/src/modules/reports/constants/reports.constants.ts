import type { BreadcrumbEntry } from "@/shared/types/breadcrumb-entry.types";
import { REPORTS_HOME_PATH } from "./reports-navigation.constants";

export const REGISTERED_USERS_PAGE_SIZE = 10;
export const REJECTED_USERS_PAGE_SIZE = 10;
export const REPORT_HISTORY_PAGE_SIZE = 10;

export const SEARCH_DEBOUNCE_MS = 300;

export const REGISTERED_USERS_CSV_FALLBACK_NAME = "usuarios-registrados.csv";
export const REJECTED_USERS_CSV_FALLBACK_NAME = "usuarios-rechazados.csv";

export const EXPORT_SUCCESS_MESSAGE = "La exportación de la tabla ha sido un éxito";
export const EXPORT_DOWNLOAD_STARTED_MESSAGE = "Descarga iniciada. Revisa las descargas de tu navegador.";
export const EXPORT_SUCCESS_TOAST_DURATION_MS = 4000;

export const REGISTERED_USERS_BREADCRUMB: BreadcrumbEntry[] = [
  { label: "Inicio", href: REPORTS_HOME_PATH },
  { label: "Reportes Analíticos" },
  { label: "Reporte de usuarios registrados" },
];

export const REJECTED_USERS_BREADCRUMB: BreadcrumbEntry[] = [
  { label: "Inicio", href: REPORTS_HOME_PATH },
  { label: "Reportes Analíticos" },
  { label: "Reporte de usuarios rechazados" },
];

export const REPORT_HISTORY_BREADCRUMB: BreadcrumbEntry[] = [
  { label: "Inicio", href: REPORTS_HOME_PATH },
  { label: "Reportes Analíticos" },
  { label: "Historial de reportes generados" },
];
