import type { PaginatedData } from "@/shared/types/api-response.types";
import type { DocumentType } from "@/modules/access-request/constants/document-types.constants";

export interface RejectedUser {
  id: string;
  fullName: string;
  email: string;
  identifier: string;
  documentType: DocumentType | null;
  registeredAt: string;
}

export interface RejectedUsersParams {
  page: number;
  limit: number;
  search?: string;
}

export type RejectedUsersExportParams = Pick<RejectedUsersParams, "search">;

export interface RejectedUsersState {
  requestKey: string;
  result?: PaginatedData<RejectedUser>;
  errorMessage?: string;
}
