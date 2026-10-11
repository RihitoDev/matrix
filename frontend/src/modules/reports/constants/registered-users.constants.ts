import type { UserDocumentType, UserType } from "../types/registered-user.types";

export const USER_TYPE_LABELS: Record<UserType, string> = {
  STUDENT: "Estudiante",
  GRADUATE: "Egresado",
  DEGREE_HOLDER: "Titulado",
  MENTOR: "Mentor",
  COMPANY: "Empresa",
  ADMIN: "Administrador",
};

export const USER_TYPE_FILTER_OPTIONS: UserType[] = ["STUDENT", "DEGREE_HOLDER", "MENTOR", "COMPANY", "ADMIN"];

export const USER_DOCUMENT_LABELS: Record<UserDocumentType, string> = {
  ACADEMIC_DEGREE: "Título académico",
  NATIONAL_DEGREE: "Título en provisión nacional",
  GRADUATION_CERTIFICATE: "Certificado de egreso",
  ACADEMIC_DIPLOMA: "Diploma académico",
  ENROLLMENT_CERTIFICATE: "Certificado de inscripción",
  NIT: "NIT",
};

export const ALL_USER_TYPES_VALUE = "ALL";

export const USER_TYPE_SELECT_OPTIONS = [
  { value: ALL_USER_TYPES_VALUE, label: "Todos" },
  ...USER_TYPE_FILTER_OPTIONS.map((userType) => ({ value: userType, label: USER_TYPE_LABELS[userType] })),
];
