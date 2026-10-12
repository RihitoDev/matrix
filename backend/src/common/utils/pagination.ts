import { z } from 'zod';
import type { PaginatedResult } from '../types/api-response.types.js';

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
});

export function paginate<T>(
  items: readonly T[],
  page: number,
  limit: number,
): PaginatedResult<T> {
  const start = (page - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    totalItems: items.length,
    totalPages: Math.ceil(items.length / limit),
    page,
    limit,
  };
}
