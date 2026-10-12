import type { ReportTableFooterProps } from "../types/report-table-footer-props.types";
import { RefreshButton } from "./refresh-button";
import { TablePagination } from "./table-pagination";

// Pie común de las tablas de reportes: contador, botón actualizar y paginación.
export function ReportTableFooter({
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  isLoading,
  itemLabel,
  onPageChange,
  onRefresh,
}: ReportTableFooterProps) {
  const firstVisibleItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastVisibleItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-3">
      <p className="text-center text-sm text-text-secondary md:text-left">
        {isLoading
          ? `Cargando ${itemLabel}...`
          : `Mostrando ${firstVisibleItem}-${lastVisibleItem} de ${totalItems} ${itemLabel}`}
      </p>
      <div className="flex justify-center">
        <RefreshButton onClick={onRefresh} isRefreshing={isLoading} />
      </div>
      <div className="flex justify-center md:justify-end">
        <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}