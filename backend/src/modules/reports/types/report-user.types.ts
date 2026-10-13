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
