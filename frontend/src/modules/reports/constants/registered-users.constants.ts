import type { RoleTag } from "@/modules/auth/types/auth-types";

export const USER_TYPE_LABELS: Record<RoleTag, string> = {
  titulado: "Titulado",
  estudiante: "Estudiante",
  mentor: "Mentor",
  empresa: "Empresa",
  administrativo: "Administrativo",
};

export const USER_TYPE_FILTER_OPTIONS: RoleTag[] = ["estudiante", "titulado", "mentor", "empresa", "administrativo"];

export const EMPTY_DOCUMENT_LABEL = "-";

export const ALL_USER_TYPES_VALUE = "ALL";

export const USER_TYPE_SELECT_OPTIONS = [
  { value: ALL_USER_TYPES_VALUE, label: "Todos" },
  ...USER_TYPE_FILTER_OPTIONS.map((userType) => ({ value: userType, label: USER_TYPE_LABELS[userType] })),
];
