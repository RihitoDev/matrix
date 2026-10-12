"use client";

import { useState } from "react";
import { PageBreadcrumb } from "@/shared/components/layout";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import {
  CONNECTION_ERROR_MESSAGE,
  REGISTERED_USERS_BREADCRUMB,
  REGISTERED_USERS_PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
  SLOW_REQUEST_MESSAGE,
} from "../constants/reports.constants";
import { EmailSearchInput } from "../components/email-search-input";
import { ExportSuccessToast } from "../components/export-success-toast";
import { RegisteredUsersTable } from "../components/registered-users-table";
import { ReportActions } from "../components/report-actions";
import { ReportAlertToast } from "../components/report-alert-toast";
import { ReportTableFooter } from "../components/report-table-footer";
import { UserTypeFilter } from "../components/user-type-filter";
import { useExportRegisteredUsersCsv } from "../hooks/use-export-registered-users-csv";
import { useRegisteredUsers } from "../hooks/use-registered-users";
import type { AcademicPeriod } from "../types/registered-user.types";
import type { RoleTag } from "@/modules/auth/types/auth-types";

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
    errorMessage: exportErrorMessage,
    successMessage: exportSuccessMessage,
  } = useExportRegisteredUsersCsv(userType, period, search);

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
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <PageBreadcrumb items={REGISTERED_USERS_BREADCRUMB} />
        <h1 className="font-tight text-3xl font-extrabold text-ink">Reporte de usuarios registrados aceptados</h1>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <UserTypeFilter value={userType} onChange={handleUserTypeChange} />
          <EmailSearchInput value={searchInput} onChange={handleSearchChange} />
        </div>
        <ReportActions onExport={exportCsv} isExporting={isExporting} period={period} onPeriodChange={handlePeriodChange} />
      </div>

      {exportErrorMessage && (
        <p role="alert" className="text-sm text-accent">
          {exportErrorMessage}
        </p>
      )}

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
      <ReportAlertToast variant="warning" message={isSlow ? SLOW_REQUEST_MESSAGE : undefined} />
      <ReportAlertToast variant="error" message={hasConnectionError ? CONNECTION_ERROR_MESSAGE : undefined} />
    </section>
  );
}