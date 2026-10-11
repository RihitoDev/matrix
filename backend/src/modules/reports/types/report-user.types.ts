export const REPORT_USER_TYPES = [
  'STUDENT',
  'GRADUATE',
  'DEGREE_HOLDER',
  'MENTOR',
  'COMPANY',
  'ADMIN',
] as const;

export const REPORT_DOCUMENT_TYPES = [
  'ACADEMIC_DEGREE',
  'NATIONAL_DEGREE',
  'GRADUATION_CERTIFICATE',
  'ACADEMIC_DIPLOMA',
  'ENROLLMENT_CERTIFICATE',
  'NIT',
] as const;

export type ReportUserType = (typeof REPORT_USER_TYPES)[number];

export type ReportDocumentType = (typeof REPORT_DOCUMENT_TYPES)[number];

export type ReportRegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ReportUser {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly userType: ReportUserType;
  readonly identifier: string;
  readonly documentType: ReportDocumentType;
  readonly registeredAt: string;
  readonly registrationStatus: ReportRegistrationStatus;
  readonly rejectionReason: string | null;
}

export interface RegisteredUserResponse {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly userType: ReportUserType;
  readonly identifier: string;
  readonly documentType: ReportDocumentType;
  readonly registeredAt: string;
}

export interface RejectedUserResponse {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly identifier: string;
  readonly documentType: ReportDocumentType;
  readonly rejectionReason: string | null;
  readonly registeredAt: string;
}

export interface ReportCsvFile {
  readonly fileName: string;
  readonly content: string;
}
