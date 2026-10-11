import { FileSearchCorner } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { TABLE_SKELETON_ROWS } from "../constants/report-table.constants";
import type { TableMessageRowProps, TableSkeletonRowsProps } from "../types/table-state-rows-props.types";

export function TableSkeletonRows({ columnCount }: TableSkeletonRowsProps) {
  return Array.from({ length: TABLE_SKELETON_ROWS }, (_, index) => (
    <TableRow key={index} data-testid="skeleton-row" className="border-border hover:bg-transparent">
      {Array.from({ length: columnCount }, (_, cellIndex) => (
        <TableCell key={cellIndex} className="px-6 py-4">
          <Skeleton className="h-4 w-3/4 rounded bg-border" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

export function TableMessageRow({ columnCount, message }: TableMessageRowProps) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={columnCount} className="whitespace-normal px-6 py-10 text-center text-text-secondary">
        {message}
      </TableCell>
    </TableRow>
  );
}

export function TableNoResultsRow({ columnCount, message }: TableMessageRowProps) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={columnCount} className="whitespace-normal px-6 py-16">
        <div role="status" className="mx-auto flex max-w-56 flex-col items-center gap-4 text-center">
          <FileSearchCorner className="size-14 text-ink-soft" strokeWidth={1.25} aria-hidden="true" />
          <p className="text-base font-semibold text-ink">{message}</p>
        </div>
      </TableCell>
    </TableRow>
  );
}
