import { isApiError } from "@/shared/services/api-client";

export function isConnectionError(error: unknown): boolean {
  if (!isApiError(error)) return false;
  if (!error.response) return true;

  return error.response.status === 503 || error.response.status === 504;
}