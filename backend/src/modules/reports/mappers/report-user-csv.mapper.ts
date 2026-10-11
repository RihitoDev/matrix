import type {
  RegisteredUserResponse,
  RejectedUserResponse,
  ReportDocumentType,
  ReportUserType,
} from '../types/report-user.types.js';

const USER_TYPE_LABELS: Record<ReportUserType, string> = {
  STUDENT: 'Estudiante',
  GRADUATE: 'Egresado',
  DEGREE_HOLDER: 'Titulado',
  MENTOR: 'Mentor',
  COMPANY: 'Empresa',
  ADMIN: 'Administrador',
};

const DOCUMENT_TYPE_LABELS: Record<ReportDocumentType, string> = {
  ACADEMIC_DEGREE: 'Título académico',
  NATIONAL_DEGREE: 'Título en provisión nacional',
  GRADUATION_CERTIFICATE: 'Certificado de egreso',
  ACADEMIC_DIPLOMA: 'Diploma académico',
  ENROLLMENT_CERTIFICATE: 'Certificado de inscripción',
  NIT: 'NIT',
};

const REPORT_TIME_ZONE = 'America/La_Paz';

const DATE_FORMATTER = new Intl.DateTimeFormat('es-BO', {
  timeZone: REPORT_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export const REGISTERED_USERS_CSV_HEADERS = [
  'Usuario',
  'Correo',
  'Tipo de Usuario',
  'Identificador',
  'Documento',
  'Fecha de Registro',
] as const;

export const REJECTED_USERS_CSV_HEADERS = [
  'Usuario',
  'Correo',
  'Identificador',
  'Documento',
  'Fecha de Registro',
] as const;

export function formatReportDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const parts = DATE_FORMATTER.formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return `${getPart('day')}/${getPart('month')}/${getPart('year')}`;
}

export function toRegisteredUserCsvRow(user: RegisteredUserResponse): string[] {
  return [
    user.fullName,
    user.email,
    USER_TYPE_LABELS[user.userType],
    user.identifier,
    DOCUMENT_TYPE_LABELS[user.documentType],
    formatReportDate(user.registeredAt),
  ];
}

export function toRejectedUserCsvRow(user: RejectedUserResponse): string[] {
  return [
    user.fullName,
    user.email,
    user.identifier,
    DOCUMENT_TYPE_LABELS[user.documentType],
    formatReportDate(user.registeredAt),
  ];
}
