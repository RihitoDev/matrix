import { EDGE_BLOCK_SIZE, MAX_VISIBLE_ITEMS } from "../constants/table-pagination.constants";
import type { PaginationItem } from "../types/pagination-item.types";

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function getPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 0) return [];

  if (totalPages <= MAX_VISIBLE_ITEMS) {
    return range(1, totalPages);
  }

  if (currentPage < EDGE_BLOCK_SIZE) {
    return [...range(1, EDGE_BLOCK_SIZE), "ellipsis-end", totalPages];
  }

  if (currentPage > totalPages - EDGE_BLOCK_SIZE + 1) {
    return [1, "ellipsis-start", ...range(totalPages - EDGE_BLOCK_SIZE + 1, totalPages)];
  }

  return [1, "ellipsis-start", currentPage - 1, currentPage, currentPage + 1, "ellipsis-end", totalPages];
}
