"use client";

import { useState } from "react";
import { PageBreadcrumb } from "@/shared/components/layout";
import { REGISTERED_USERS_BREADCRUMB, REGISTERED_USERS_PAGE_SIZE } from "../constants/reports.constants";
import { ExportSuccessToast } from "../components/export-success-toast";
import { RefreshButton } from "../components/refresh-button";
import { RegisteredUsersTable } from "../components/registered-users-table";
import { ReportActions } from "../components/report-actions";
import { TablePagination } from "../components/table-pagination";
import { UserTypeFilter } from "../components/user-type-filter";
import { useExportRegisteredUsersCsv } from "../hooks/use-export-registered-users-csv";
import { useRegisteredUsers } from "../hooks/use-registered-users";
import type { AcademicPeriod } from "../types/registered-user.types";
import type { RoleTag } from "@/modules/auth/types/auth-types";

export function RegisteredUsersReportView() {
  const [currentPage, setCurrentPage] = useState(1);
  const [userType, setUserType] = useState<RoleTag | undefined>(undefined);
  const [period, setPeriod] = useState<AcademicPeriod | undefined>(undefined);
  const { users, totalItems, totalPages, isLoading, errorMessage, refresh } = useRegisteredUsers(currentPage, userType, period);
  const {
    exportCsv,
    isExporting,
    errorMessage: exportErrorMessage,
    successMessage: exportSuccessMessage,
    downloadMessage: exportDownloadMessage,
  } = useExportRegisteredUsersCsv(userType, period);

  const handleUserTypeChange = (selectedUserType?: RoleTag) => {
    if (selectedUserType === userType) return;
    setUserType(selectedUserType);
    setCurrentPage(1);
  };

  const handlePeriodChange = (selectedPeriod?: AcademicPeriod) => {
    if (selectedPeriod === period) return;
    setPeriod(selectedPeriod);
    setCurrentPage(1);
  };

  const firstVisibleItem = totalItems === 0 ? 0 : (currentPage - 1) * REGISTERED_USERS_PAGE_SIZE + 1;
  const lastVisibleItem = Math.min(currentPage * REGISTERED_USERS_PAGE_SIZE, totalItems);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <PageBreadcrumb items={REGISTERED_USERS_BREADCRUMB} />
        <h1 className="font-tight text-3xl font-extrabold text-ink">Reporte de usuarios registrados</h1>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <UserTypeFilter value={userType} onChange={handleUserTypeChange} />
        <ReportActions onExport={exportCsv} isExporting={isExporting} period={period} onPeriodChange={handlePeriodChange} />
      </div>

      {exportErrorMessage && (
        <p role="alert" className="text-sm text-accent">
          {exportErrorMessage}
        </p>
      )}

      <RegisteredUsersTable users={users} isLoading={isLoading} errorMessage={errorMessage} />

      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-3">
        <p className="text-center text-sm text-text-secondary md:text-left">
          {isLoading ? "Cargando usuarios..." : `Mostrando ${firstVisibleItem}-${lastVisibleItem} de ${totalItems} usuarios`}
        </p>
        <div className="flex justify-center">
          <RefreshButton onClick={refresh} isRefreshing={isLoading} />
        </div>
        <div className="flex justify-center md:justify-end">
          <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      <ExportSuccessToast
        message={exportSuccessMessage ?? exportDownloadMessage}
        variant={exportSuccessMessage ? "success" : "info"}
      />
    </section>
  );
}
