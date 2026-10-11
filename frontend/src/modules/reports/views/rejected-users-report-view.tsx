"use client";

import { useState } from "react";
import { PageBreadcrumb } from "@/shared/components/layout";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import {
  REJECTED_USERS_BREADCRUMB,
  REJECTED_USERS_PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
} from "../constants/reports.constants";
import { EmailSearchInput } from "../components/email-search-input";
import { ExportCsvButton } from "../components/export-csv-button";
import { ExportSuccessToast } from "../components/export-success-toast";
import { RefreshButton } from "../components/refresh-button";
import { RejectedUsersTable } from "../components/rejected-users-table";
import { TablePagination } from "../components/table-pagination";
import { useExportRejectedUsersCsv } from "../hooks/use-export-rejected-users-csv";
import { useRejectedUsers } from "../hooks/use-rejected-users";

export function RejectedUsersReportView() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS);
  const { users, totalItems, totalPages, isLoading, errorMessage, refresh } = useRejectedUsers(currentPage, search);
  const {
    exportCsv,
    isExporting,
    errorMessage: exportErrorMessage,
    successMessage: exportSuccessMessage,
    downloadMessage: exportDownloadMessage,
  } = useExportRejectedUsersCsv(search);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setCurrentPage(1);
  };

  const firstVisibleItem = totalItems === 0 ? 0 : (currentPage - 1) * REJECTED_USERS_PAGE_SIZE + 1;
  const lastVisibleItem = Math.min(currentPage * REJECTED_USERS_PAGE_SIZE, totalItems);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <PageBreadcrumb items={REJECTED_USERS_BREADCRUMB} />
        <h1 className="font-tight text-3xl font-extrabold uppercase text-ink">Reporte de usuarios rechazados</h1>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <EmailSearchInput value={searchInput} onChange={handleSearchChange} />
        <ExportCsvButton onClick={exportCsv} isExporting={isExporting} />
      </div>

      {exportErrorMessage && (
        <p role="alert" className="text-sm text-accent">
          {exportErrorMessage}
        </p>
      )}

      <RejectedUsersTable
        users={users}
        isLoading={isLoading}
        errorMessage={errorMessage}
        searchTerm={search}
      />

      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-3">
        <p className="text-center text-sm text-text-secondary md:text-left">
          {isLoading ? "Cargando usuarios..." : `Mostrando ${firstVisibleItem}-${lastVisibleItem} de ${totalItems} usuarios`}
        </p>
        <div className="flex justify-center">
          <RefreshButton label="Actualizar" onClick={refresh} isRefreshing={isLoading} />
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
