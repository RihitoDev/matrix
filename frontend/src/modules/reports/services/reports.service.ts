import { apiClient } from "@/shared/services/api-client";
import type { ApiResponse, PaginatedData } from "@/shared/types/api-response.types";
import { getFileNameFromDisposition } from "@/shared/utils/download-file";
import {
  REGISTERED_USERS_CSV_FALLBACK_NAME,
  REJECTED_USERS_CSV_FALLBACK_NAME,
} from "../constants/reports.constants";
import type { GeneratedReport, ReportHistoryParams } from "../types/generated-report.types";
import type {
  ExportedFile,
  RegisteredUser,
  RegisteredUsersExportParams,
  RegisteredUsersParams,
} from "../types/registered-user.types";
import type {
  RejectedUser,
  RejectedUsersExportParams,
  RejectedUsersParams,
} from "../types/rejected-user.types";

async function downloadCsv(url: string, params: object, fallbackName: string): Promise<ExportedFile> {
  const response = await apiClient.get<Blob>(url, { params, responseType: "blob" });

  return {
    file: response.data,
    fileName: getFileNameFromDisposition(
      response.headers["content-disposition"] as string | undefined,
      fallbackName,
    ),
  };
}

export const reportsService = {
  getReportHistory: async ({
    page,
    limit,
  }: ReportHistoryParams): Promise<ApiResponse<PaginatedData<GeneratedReport>>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedData<GeneratedReport>>>("/reports/history", {
      params: { page, limit },
    });

    return data;
  },

  getRegisteredUsers: async ({
    page,
    limit,
    userType,
  }: RegisteredUsersParams): Promise<ApiResponse<PaginatedData<RegisteredUser>>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedData<RegisteredUser>>>("/reports/registered-users", {
      params: { page, limit, userType },
    });

    return data;
  },

  exportRegisteredUsersCsv: ({ userType }: RegisteredUsersExportParams): Promise<ExportedFile> =>
    downloadCsv("/reports/registered-users/export", { userType }, REGISTERED_USERS_CSV_FALLBACK_NAME),

  getRejectedUsers: async ({
    page,
    limit,
    search,
  }: RejectedUsersParams): Promise<ApiResponse<PaginatedData<RejectedUser>>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedData<RejectedUser>>>("/reports/rejected-users", {
      params: { page, limit, search: search || undefined },
    });

    return data;
  },

  exportRejectedUsersCsv: ({ search }: RejectedUsersExportParams): Promise<ExportedFile> =>
    downloadCsv("/reports/rejected-users/export", { search: search || undefined }, REJECTED_USERS_CSV_FALLBACK_NAME),
};
