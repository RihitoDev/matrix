export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  limit: number;
}
