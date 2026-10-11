export interface ApiResponse<T> {
  statusCode: number;
  ok: boolean;
  detail: string;
  data: T;
  page?: number;
  offset?: number;
}

export interface PaginatedData<T> {
  items: T[];
  totalItems: number;
}
