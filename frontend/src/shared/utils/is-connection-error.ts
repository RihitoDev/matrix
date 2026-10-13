import axios from "axios";

export function isConnectionError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  if (!error.response) return true;

  return error.response.status === 503 || error.response.status === 504;
}