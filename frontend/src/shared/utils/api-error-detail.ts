import type { ApiErrorBody } from "../types/api-error-body.types";

export function getApiErrorDetail(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const { response } = error as { response?: { data?: unknown } };
  const data = response?.data as ApiErrorBody | undefined;
  if (typeof data?.detail !== "string" || data.detail.length === 0) return undefined;
  return data.detail;
}
