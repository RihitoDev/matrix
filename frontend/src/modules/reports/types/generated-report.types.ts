import type { PaginatedData } from "@/shared/types/api-response.types";

export type ReportType = "REGISTERED_USERS" | "GRADUATES" | "REJECTED_USERS";

export interface GeneratedReport {
  id: string;
  fileName: string;
  reportType: ReportType;
  generatedAt: string;
}

export interface ReportHistoryParams {
  page: number;
  limit: number;
}

export interface ReportHistoryState {
  page: number;
  result?: PaginatedData<GeneratedReport>;
  errorMessage?: string;
}
