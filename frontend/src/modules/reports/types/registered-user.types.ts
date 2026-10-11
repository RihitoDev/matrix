import type { DocumentType } from "@/modules/access-request/constants/document-types.constants";
import type { RoleTag } from "@/modules/auth/types/auth-types";
import type { PaginatedData } from "@/shared/types/api-response.types";

export interface RegisteredUser {
  id: string;
  fullName: string;
  email: string;
  userType: RoleTag;
  identifier: string;
  documentType: DocumentType | null;
  registeredAt: string;
}

export type AcademicPeriod = `${"I" | "II"}-${number}`;

export interface RegisteredUsersParams {
  page: number;
  limit: number;
  userType?: RoleTag;
  period?: AcademicPeriod;
}

export type RegisteredUsersExportParams = Pick<RegisteredUsersParams, "userType" | "period">;

export interface ExportedFile {
  file: Blob;
  fileName: string;
}

export interface RegisteredUsersState {
  requestKey: string;
  result?: PaginatedData<RegisteredUser>;
  errorMessage?: string;
}
