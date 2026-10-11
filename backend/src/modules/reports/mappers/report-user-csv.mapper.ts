import type { RoleName } from '../../../common/enums/roles.enum.js';
import { toBoliviaTime } from '../../../common/utils/date-time.js';
import type {
  RegisteredUserResponse,
  RejectedUserResponse,
  ReportDocumentType,
} from '../types/report-user.types.js';

export const USER_TYPE_LABELS: Record<RoleName, string> = {
  titulado: 'Titulado',
  estudiante: 'Estudiante',
  mentor: 'Mentor',
  empresa: 'Empresa',
  administrativo: 'Administrativo',
};

const DOCUMENT_TYPE_LABELS: Record<ReportDocumentType, string> = {
  academic_diploma: 'Diploma académico',
  national_title: 'Título en provisión nacional',
};

const EMPTY_VALUE = '-';

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
  if (Number.isNaN(new Date(isoDate).getTime())) {
    return EMPTY_VALUE;
  }

  const [year, month, day] = toBoliviaTime(isoDate).date.split('-');
  return `${day}/${month}/${year}`;
}

function toDocumentLabel(documentType: ReportDocumentType | null): string {
  return documentType ? DOCUMENT_TYPE_LABELS[documentType] : EMPTY_VALUE;
}

export function toRegisteredUserCsvRow(user: RegisteredUserResponse): string[] {
  return [
    user.fullName,
    user.email,
    USER_TYPE_LABELS[user.userType],
    user.identifier,
    toDocumentLabel(user.documentType),
    formatReportDate(user.registeredAt),
  ];
}

export function toRejectedUserCsvRow(user: RejectedUserResponse): string[] {
  return [
    user.fullName,
    user.email,
    user.identifier,
    toDocumentLabel(user.documentType),
    formatReportDate(user.registeredAt),
  ];
}
