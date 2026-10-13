import type { BreadcrumbEntry } from "@/shared/types/breadcrumb-entry.types";
import { REPORTS_HOME_PATH } from "./reports-navigation.constants";

export const REGISTERED_USERS_PAGE_SIZE = 10;
export const REJECTED_USERS_PAGE_SIZE = 10;
export const REPORT_HISTORY_PAGE_SIZE = 10;

export const SEARCH_DEBOUNCE_MS = 300;
export const EMAIL_SEARCH_NO_RESULTS_MESSAGE = "No se encontró ningún usuario con el correo";

export const SLOW_REQUEST_THRESHOLD_MS = 10_000;
export const SLOW_REQUEST_MESSAGE = "Error 408: La solicitud está tardando demasiado";
export const CONNECTION_ERROR_MESSAGE = "Error 503/504: Sin conexión con el servidor";
export const RATE_LIMIT_MESSAGE = "Error 429: Demasiadas solicitudes, intenta nuevamente en unos segundos";
export const INTERNAL_ERROR_MESSAGE = "Error 500: Ocurrió un error interno en el servidor";
export const REPORT_ALERT_DURATION_MS = 7_000;
export const REGISTERED_USERS_SLOW_TOAST_ID = "registered-users-slow-request";
export const REGISTERED_USERS_CONNECTION_TOAST_ID = "registered-users-connection-error";
export const REJECTED_USERS_LOAD_ERROR_MESSAGE = "No se pudo cargar el reporte de usuarios rechazados.";

export const REGISTERED_USERS_CSV_FALLBACK_NAME = "usuarios-registrados.csv";
export const REJECTED_USERS_CSV_FALLBACK_NAME = "usuarios-rechazados.csv";

export const EXPORT_SUCCESS_MESSAGE = "La exportación de la tabla ha sido un éxito";
export const EXPORT_SUCCESS_TOAST_DURATION_MS = 4000;

export const REGISTERED_USERS_BREADCRUMB: BreadcrumbEntry[] = [
  { label: "Inicio", href: REPORTS_HOME_PATH },
  { label: "Reportes Analíticos" },
  { label: "Reporte de usuarios registrados" },
];

export const REJECTED_USERS_BREADCRUMB: BreadcrumbEntry[] = [
  { label: "Inicio", href: REPORTS_HOME_PATH },
  { label: "Reportes Analíticos" },
  { label: "Reporte de usuarios registrados rechazados" },
];

export const REPORT_HISTORY_BREADCRUMB: BreadcrumbEntry[] = [
  { label: "Inicio", href: REPORTS_HOME_PATH },
  { label: "Reportes Analíticos" },
  { label: "Historial de reportes generados" },
];
