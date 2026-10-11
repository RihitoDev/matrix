"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "cn";
import { getInitials } from "@/shared/utils/get-initials";
import { DOCUMENT_TYPE_LABELS, INBOX_PATH, REVIEW_PAGE_SIZE } from "../../constants/request-review.constants";
import { formatRelativeTime } from "../../utils/format-relative-time";
import { StatusBadge } from "../common/status-badge";
import type { RequestTableProps } from "../../types/request-table-props.types";

const HEAD_CLASS = "h-10 px-5 text-[12.5px] font-semibold text-text-secondary";
const CELL_CLASS = "px-5 text-[14.5px] text-ink";

export function RequestTable({ items = [], isLoading = false }: RequestTableProps) {
  return (
    <Table>
      <TableHeader className="bg-surface-soft">
        <TableRow className="hover:bg-transparent">
          <TableHead className={HEAD_CLASS}>Solicitante</TableHead>
          <TableHead className={HEAD_CLASS}>Código SIS</TableHead>
          <TableHead className={HEAD_CLASS}>Documento</TableHead>
          <TableHead className={HEAD_CLASS}>Enviada</TableHead>
          <TableHead className={HEAD_CLASS}>Estado</TableHead>
          <TableHead className={cn(HEAD_CLASS, "text-right")}>Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: REVIEW_PAGE_SIZE / 2 }, (_, index) => (
              <TableRow key={index} data-testid="request-skeleton-row" className="h-[60px] border-border">
                {Array.from({ length: 6 }, (_, cell) => (
                  <TableCell key={cell} className={CELL_CLASS}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : items.map((item) => (
              <TableRow key={item.id} className="h-[60px] border-border">
                <TableCell className={CELL_CLASS}>
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface-soft text-sm font-bold text-ink"
                      aria-hidden="true"
                    >
                      {getInitials(item.fullName)}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-ink">{item.fullName}</span>
                      <span className="text-[13px] text-text-secondary">{item.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className={CELL_CLASS}>{item.sisCode}</TableCell>
                <TableCell className={CELL_CLASS}>
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="size-4 text-text-secondary" strokeWidth={1.75} aria-hidden="true" />
                    {item.documentType ? (DOCUMENT_TYPE_LABELS[item.documentType] ?? item.documentType) : "Sin documento"}
                  </span>
                </TableCell>
                <TableCell className={cn(CELL_CLASS, "text-text-secondary")}>{formatRelativeTime(item.submittedAt)}</TableCell>
                <TableCell className={CELL_CLASS}>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell className={cn(CELL_CLASS, "text-right")}>
                  {/* Button con render={<Link />} no es un botón nativo; por eso se usa Link con las clases de buttonVariants */}
                  <Link
                    href={`${INBOX_PATH}/${item.id}`}
                    className={cn(buttonVariants({ variant: "outline" }), "h-[34px] rounded-lg border-border bg-surface px-4 text-[14px] font-semibold text-ink")}
                  >
                    Revisar
                  </Link>
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
}
