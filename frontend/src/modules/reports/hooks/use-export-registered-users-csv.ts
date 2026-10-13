"use client";

import { useCallback } from "react";
import { REGISTERED_USERS_CSV_FALLBACK_NAME } from "../constants/reports.constants";
import { reportsService } from "../services/reports.service";
import type { AcademicPeriod } from "../types/registered-user.types";
import type { RoleTag } from "@/modules/auth/types/auth-types";
import { useExportReportCsv } from "./use-export-report-csv";

export function useExportRegisteredUsersCsv(userType?: RoleTag, period?: AcademicPeriod) {
  const exportReport = useCallback(
    () => reportsService.exportRegisteredUsersCsv({ userType, period }),
    [userType, period],
  );

  return useExportReportCsv(exportReport, REGISTERED_USERS_CSV_FALLBACK_NAME);
}
