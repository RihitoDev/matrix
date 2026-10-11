import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import {
  CURRENT_PAGE_CLASSES,
  NAV_BUTTON_CLASSES,
  PAGE_BUTTON_CLASSES,
} from "../constants/table-pagination.constants";
import type { TablePaginationProps } from "../types/table-pagination-props.types";

export function TablePagination({ currentPage, totalPages, onPageChange }: TablePaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <Pagination aria-label="Paginación" className="mx-0 w-auto">
      <PaginationContent className="gap-2">
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

        {pages.map((page) => {
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
