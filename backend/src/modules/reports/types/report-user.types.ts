import type { RoleName } from '../../../common/enums/roles.enum.js';
import type { ACCESS_REQUEST_DOCUMENT_TYPE } from '../../access-requests/types/access-request.enum.js';

export type ReportDocumentType =
  (typeof ACCESS_REQUEST_DOCUMENT_TYPE)[keyof typeof ACCESS_REQUEST_DOCUMENT_TYPE];

export type ReportRegistrationStatus = 'APPROVED' | 'REJECTED';

export interface ReportUser {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly userType: RoleName;
  readonly identifier: string;
  readonly documentType: ReportDocumentType | null;
  readonly registeredAt: string;
  readonly registrationStatus: ReportRegistrationStatus;
  readonly rejectionReason: string | null;
}

export interface RegisteredUserResponse {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly userType: RoleName;
  readonly identifier: string;
  readonly documentType: ReportDocumentType | null;
  readonly registeredAt: string;
}

export interface RejectedUserResponse {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly identifier: string;
  readonly documentType: ReportDocumentType | null;
  readonly rejectionReason: string | null;
  readonly registeredAt: string;
}

export interface ReportCsvFile {
  readonly fileName: string;
  readonly content: string;
}

export interface ReportUserRecord {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly createdAt: Date;
  readonly roles: readonly { readonly role: { readonly name: string } }[];
}

export interface ReportAccessRequestRecord {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly idCardNumber: string;
  readonly rejectionReason: string | null;
  readonly submittedAt: Date | null;
  readonly createdAt: Date;
  readonly status: { readonly title: string };
  readonly documentType: { readonly title: string } | null;
}
