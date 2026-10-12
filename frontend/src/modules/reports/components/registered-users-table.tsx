import { FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/shared/utils/date.utils";
import { DOCUMENT_TYPE_LABELS } from "@/modules/request-review/constants/request-review.constants";
import { EMPTY_DOCUMENT_LABEL, USER_TYPE_LABELS } from "../constants/registered-users.constants";
import {
  REGISTERED_USERS_COLUMN_COUNT as COLUMN_COUNT,
  TABLE_CELL_CLASSES as CELL_CLASSES,
  USERS_TABLE_HEAD_CLASSES as HEAD_CLASSES,
} from "../constants/report-table.constants";
import type { RegisteredUsersTableProps } from "../types/registered-users-table-props.types";
import { TableMessageRow, TableSkeletonRows } from "./table-state-rows";

export function RegisteredUsersTable({ users, isLoading, errorMessage }: RegisteredUsersTableProps) {
  const renderBody = () => {
    if (isLoading) {
      return <TableSkeletonRows columnCount={COLUMN_COUNT} />;
    }

    if (errorMessage) {
      return <TableMessageRow columnCount={COLUMN_COUNT} message={errorMessage} />;
    }

    if (users.length === 0) {
      return <TableMessageRow columnCount={COLUMN_COUNT} message="No hay usuarios registrados para este filtro." />;
    }

    return users.map((user) => (
      <TableRow key={user.id} className="border-border hover:bg-surface-soft">
        <TableCell className={`${CELL_CLASSES} text-ink`}>{user.fullName}</TableCell>
        <TableCell className={CELL_CLASSES}>{user.email}</TableCell>
        <TableCell className={CELL_CLASSES}>{USER_TYPE_LABELS[user.userType]}</TableCell>
        <TableCell className={`${CELL_CLASSES} tabular-nums`}>{user.identifier}</TableCell>
        <TableCell className={CELL_CLASSES}>
          <span className="flex items-center gap-2">
            <FileText className="size-5 shrink-0 text-ink" strokeWidth={1.5} aria-hidden="true" />
            {user.documentType ? DOCUMENT_TYPE_LABELS[user.documentType] : EMPTY_DOCUMENT_LABEL}
          </span>
        </TableCell>
        <TableCell className={CELL_CLASSES}>{formatDate(user.registeredAt)}</TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="rounded-lg border border-border bg-surface">
      <Table className="min-w-225 text-left text-base">
        <TableHeader className="bg-surface-soft">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead scope="col" className={HEAD_CLASSES}>Usuario</TableHead>
            <TableHead scope="col" className={HEAD_CLASSES}>Correo</TableHead>
            <TableHead scope="col" className={HEAD_CLASSES}>Tipo de Usuario</TableHead>
            <TableHead scope="col" className={HEAD_CLASSES}>Identificador</TableHead>
            <TableHead scope="col" className={HEAD_CLASSES}>Documento</TableHead>
            <TableHead scope="col" className={HEAD_CLASSES}>Fecha de Registro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody aria-busy={isLoading}>{renderBody()}</TableBody>
      </Table>
    </div>
  );
}
