import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from "@/components/ui/pagination";
import {
  CURRENT_PAGE_CLASSES,
  NAV_BUTTON_CLASSES,
  PAGE_BUTTON_CLASSES,
} from "../constants/table-pagination.constants";
import type { TablePaginationProps } from "../types/table-pagination-props.types";
import { getPaginationItems } from "../utils/pagination-items";

export function TablePagination({ currentPage, totalPages, onPageChange }: TablePaginationProps) {
  const items = getPaginationItems(currentPage, totalPages);

  return (
    <Pagination aria-label="Paginación" className="mx-0 w-auto">
      <PaginationContent className="flex-wrap justify-center gap-2">
        <PaginationItem>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Página anterior"
            className={NAV_BUTTON_CLASSES}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
        </PaginationItem>

        {items.map((page) => {
          if (typeof page !== "number") {
            return (
              <PaginationItem key={page}>
                <PaginationEllipsis className="size-9 text-ink-soft" />
              </PaginationItem>
            );
          }

          const isCurrent = page === currentPage;

          return (
            <PaginationItem key={page}>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onPageChange(page)}
                aria-current={isCurrent ? "page" : undefined}
                aria-label={`Página ${page}`}
                className={isCurrent ? CURRENT_PAGE_CLASSES : PAGE_BUTTON_CLASSES}
              >
                {page}
              </Button>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Página siguiente"
            className={NAV_BUTTON_CLASSES}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
