"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { WorkspacePage } from "@/shared/components/layout/workspace-page";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import {
  CONNECTION_ERROR_MESSAGE,
  REGISTERED_USERS_CONNECTION_TOAST_ID,
  REGISTERED_USERS_PAGE_SIZE,
  REGISTERED_USERS_SLOW_TOAST_ID,
  REPORT_ALERT_DURATION_MS,
  SEARCH_DEBOUNCE_MS,
  SLOW_REQUEST_MESSAGE,
} from "../constants/reports.constants";
import { EmailSearchInput } from "../components/email-search-input";
import { ExportSuccessToast } from "../components/export-success-toast";
import { RegisteredUsersTable } from "../components/registered-users-table";
import { ReportActions } from "../components/report-actions";
import { ReportTableFooter } from "../components/report-table-footer";
import { UserTypeFilter } from "../components/user-type-filter";
import { useExportRegisteredUsersCsv } from "../hooks/use-export-registered-users-csv";
import { useRegisteredUsers } from "../hooks/use-registered-users";
import type { AcademicPeriod } from "../types/registered-user.types";
import type { RoleTag } from "@/modules/auth";

export function RegisteredUsersReportView() {
  const [currentPage, setCurrentPage] = useState(1);
  const [userType, setUserType] = useState<RoleTag | undefined>(undefined);
  const [period, setPeriod] = useState<AcademicPeriod | undefined>(undefined);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS);
  const { users, totalItems, totalPages, isLoading, errorMessage, isSlow, hasConnectionError, refresh } =
    useRegisteredUsers(currentPage, userType, period, search);
  const {
    exportCsv,
    isExporting,
    successMessage: exportSuccessMessage,
  } = useExportRegisteredUsersCsv(userType, period, search);

  useEffect(() => {
    if (isSlow) {
      toast.warning(SLOW_REQUEST_MESSAGE, {
        id: REGISTERED_USERS_SLOW_TOAST_ID,
        duration: Infinity,
        closeButton: true,
        richColors: true,
      });
    } else {
      toast.dismiss(REGISTERED_USERS_SLOW_TOAST_ID);
    }
  }, [isSlow]);

  useEffect(() => {
    if (hasConnectionError) {
      toast.error(CONNECTION_ERROR_MESSAGE, {
        id: REGISTERED_USERS_CONNECTION_TOAST_ID,
        duration: REPORT_ALERT_DURATION_MS,
        closeButton: true,
        richColors: true,
      });
    } else {
      toast.dismiss(REGISTERED_USERS_CONNECTION_TOAST_ID);
    }
  }, [hasConnectionError]);

  const handleUserTypeChange = (selectedUserType?: RoleTag) => {
    if (selectedUserType === userType) return;
    setUserType(selectedUserType);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    if (value.trim() !== searchInput.trim()) {
      setCurrentPage(1);
    }
    setSearchInput(value);
  };

  const handlePeriodChange = (selectedPeriod?: AcademicPeriod) => {
    if (selectedPeriod === period) return;
    setPeriod(selectedPeriod);
    setCurrentPage(1);
  };

  return (
    <WorkspacePage title="Usuarios aceptados">

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <UserTypeFilter value={userType} onChange={handleUserTypeChange} />
          <EmailSearchInput value={searchInput} onChange={handleSearchChange} />
        </div>
        <ReportActions onExport={exportCsv} isExporting={isExporting} period={period} onPeriodChange={handlePeriodChange} />
      </div>

      <RegisteredUsersTable users={users} isLoading={isLoading} errorMessage={errorMessage} searchTerm={search} />

            <ReportTableFooter
        currentPage={currentPage}
        pageSize={REGISTERED_USERS_PAGE_SIZE}
        totalItems={totalItems}
        totalPages={totalPages}
        isLoading={isLoading}
        itemLabel="usuarios"
        onPageChange={setCurrentPage}
        onRefresh={refresh}
      />

      <ExportSuccessToast message={exportSuccessMessage} />
    </WorkspacePage>
  );
}