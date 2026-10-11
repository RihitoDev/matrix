import { FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/shared/utils/date.utils";
import { REPORT_HISTORY_EMPTY_MESSAGE, REPORT_TYPE_LABELS } from "../constants/generated-report.constants";
import {
  REPORT_HISTORY_COLUMN_COUNT as COLUMN_COUNT,
  REPORT_HISTORY_HEAD_CLASSES as HEAD_CLASSES,
  TABLE_CELL_CLASSES as CELL_CLASSES,
} from "../constants/report-table.constants";
import type { ReportHistoryTableProps } from "../types/report-history-table-props.types";
import { TableMessageRow, TableSkeletonRows } from "./table-state-rows";

function renderDateTime(isoDate: string) {
  const [date, time] = formatDateTime(isoDate).split(" ");

  return (
    <>
      <span className="whitespace-nowrap">{date}</span>
      {time && (
        <>
          {" "}
          <span className="whitespace-nowrap">{time}</span>
        </>
      )}
    </>
  );
}

export function ReportHistoryTable({
  reports,
  isLoading,
  errorMessage,
  emptyMessage = REPORT_HISTORY_EMPTY_MESSAGE,
}: ReportHistoryTableProps) {
  const headClasses = `${HEAD_CLASSES} px-2 whitespace-normal md:px-6 md:whitespace-nowrap`;
  const cellClasses = `${CELL_CLASSES} px-2 py-3 whitespace-normal md:px-6 md:py-4`;

  const renderBody = () => {
    if (isLoading) {
      return <TableSkeletonRows columnCount={COLUMN_COUNT} />;
    }

    if (errorMessage) {
      return <TableMessageRow columnCount={COLUMN_COUNT} message={errorMessage} />;
    }

    if (reports.length === 0) {
      return <TableMessageRow columnCount={COLUMN_COUNT} message={emptyMessage} />;
    }

    return reports.map((report) => (
      <TableRow key={report.id} className="border-border hover:bg-surface-soft">
        <TableCell className={cellClasses}>
          <span className="flex items-center gap-3">
            <FileText className="hidden size-5 shrink-0 text-ink sm:block" strokeWidth={1.5} aria-hidden="true" />
            <span className="wrap-anywhere">{report.fileName}</span>
          </span>
        </TableCell>
        <TableCell className={`${cellClasses} md:whitespace-nowrap`}>{REPORT_TYPE_LABELS[report.reportType]}</TableCell>
        <TableCell className={`${cellClasses} md:whitespace-nowrap`}>{renderDateTime(report.generatedAt)}</TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="@container rounded-lg border border-border bg-surface">
      <Table className="text-left text-xs sm:text-sm md:min-w-160 md:text-base">
        <TableHeader className="bg-surface-soft">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead scope="col" className={headClasses}>
              Nombre del Archivo/
              <wbr />
              Reporte
            </TableHead>
            <TableHead scope="col" className={headClasses}>Tipo de Reporte</TableHead>
            <TableHead scope="col" className={headClasses}>Fecha y Hora de Generación</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody aria-busy={isLoading}>{renderBody()}</TableBody>
      </Table>
    </div>
  );
}
