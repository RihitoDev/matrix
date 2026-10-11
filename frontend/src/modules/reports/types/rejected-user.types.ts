import type { PaginatedData } from "@/shared/types/api-response.types";
import type { UserDocumentType } from "./registered-user.types";

export interface RejectedUser {
  id: string;
  fullName: string;
  email: string;
  identifier: string;
  documentType: UserDocumentType;
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
