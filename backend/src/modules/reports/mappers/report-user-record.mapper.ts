import { ROLE_NAMES, type RoleName } from '../../../common/enums/roles.enum.js';
import { DEFAULT_REPORT_USER_TYPE } from '../constants/reports-access.constants.js';
import type {
  ReportAccessRequestRecord,
  ReportDocumentType,
  ReportRegistrationStatus,
  ReportUser,
  ReportUserRecord,
} from '../types/report-user.types.js';

function toRoleName(name: string | undefined): RoleName {
  const normalized = name?.toLowerCase().trim();
  return (
    ROLE_NAMES.find((role) => role === normalized) ?? DEFAULT_REPORT_USER_TYPE
  );
}

function toFullName(firstName: string, lastName: string): string {
  return `${firstName ?? ''} ${lastName ?? ''}`.trim();
}

function toDocumentType(
  request: ReportAccessRequestRecord | undefined,
): ReportDocumentType | null {
  return (
    (request?.documentType?.title as ReportDocumentType | undefined) ?? null
  );
}

export function toRegisteredReportUser(
  user: ReportUserRecord,
  request: ReportAccessRequestRecord | undefined,
): ReportUser {
  return {
    id: user.id,
    fullName: toFullName(user.firstName, user.lastName),
    email: user.email,
    userType: toRoleName((user.roles ?? [])[0]?.role.name),
    identifier: request?.idCardNumber ?? '',
    documentType: toDocumentType(request),
    registeredAt: user.createdAt.toISOString(),
    registrationStatus: 'APPROVED',
    rejectionReason: null,
  };
}

export function toAccessRequestReportUser(
  request: ReportAccessRequestRecord,
  registrationStatus: ReportRegistrationStatus,
): ReportUser {
  return {
    id: request.id,
    fullName: toFullName(request.firstName, request.lastName),
    email: request.email,
    userType: DEFAULT_REPORT_USER_TYPE,
    identifier: request.idCardNumber ?? '',
    documentType: toDocumentType(request),
    registeredAt: (request.submittedAt ?? request.createdAt).toISOString(),
    registrationStatus,
    rejectionReason:
      registrationStatus === 'REJECTED' ? request.rejectionReason : null,
  };
}
