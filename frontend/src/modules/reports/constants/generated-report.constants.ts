import type { ReportType } from "../types/generated-report.types";

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  REGISTERED_USERS: "Lista de Usuarios",
  STUDENTS: "Estudiantes",
  DEGREE_HOLDERS: "Titulados",
  MENTORS: "Mentores",
  COMPANIES: "Empresas",
  ADMINS: "Administradores",
  REJECTED_USERS: "Rechazados",
};

export const REPORT_TYPE_FILTER_OPTIONS: ReportType[] = [
  "REGISTERED_USERS",
  "STUDENTS",
  "DEGREE_HOLDERS",
  "MENTORS",
  "COMPANIES",
  "ADMINS",
  "REJECTED_USERS",
];

export const REPORT_TYPE_SELECT_OPTIONS = REPORT_TYPE_FILTER_OPTIONS.map((reportType) => ({
  value: reportType,
  label: REPORT_TYPE_LABELS[reportType],
}));

export const REPORT_HISTORY_EMPTY_MESSAGE = "Aún no se generaron reportes.";
export const REPORT_HISTORY_EMPTY_TYPE_MESSAGE = "No hay reportes generados de este tipo.";
