import { ChartColumn } from "lucide-react";
import type { NavigationItem } from "@/shared/types/navigation-item.types";

export const REPORTS_HOME_PATH = "/backoffice";
export const REGISTERED_USERS_REPORT_PATH = "/backoffice/reports/registered-users";
export const REJECTED_USERS_REPORT_PATH = "/backoffice/reports/rejected-users";
export const REPORT_HISTORY_PATH = "/backoffice/reports/history";

export const REPORTS_NAVIGATION_ITEM: NavigationItem = {
  label: "Reportes Analíticos",
  icon: ChartColumn,
  children: [
    { label: "Reporte de usuarios registrados", href: REGISTERED_USERS_REPORT_PATH },
    { label: "Reporte de usuarios rechazados", href: REJECTED_USERS_REPORT_PATH },
    { label: "Historial de reportes generados", href: REPORT_HISTORY_PATH },
  ],
};
