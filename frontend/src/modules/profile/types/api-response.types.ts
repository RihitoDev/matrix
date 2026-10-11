export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  detail: string;
  ok: boolean;
}
