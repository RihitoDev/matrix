import { AxiosError, isAxiosError } from "axios";
import { isConnectionError } from "@/shared/utils/is-connection-error";
import {
  CONNECTION_ERROR_MESSAGE,
  INTERNAL_ERROR_MESSAGE,
  RATE_LIMIT_MESSAGE,
  SLOW_REQUEST_MESSAGE,
} from "../constants/reports.constants";
import type { ReportAlert } from "../types/report-alert.types";

export function getReportErrorAlert(error: unknown): ReportAlert | null {
  if (!isAxiosError(error)) return null;

  // El timeout se revisa antes que la conexión porque tampoco trae respuesta
  if (error.code === AxiosError.ECONNABORTED || error.code === AxiosError.ETIMEDOUT) {
    return { variant: "warning", message: SLOW_REQUEST_MESSAGE };
  }

  if (error.response?.status === 429) return { variant: "warning", message: RATE_LIMIT_MESSAGE };
  if (error.response?.status === 500) return { variant: "error", message: INTERNAL_ERROR_MESSAGE };
  if (isConnectionError(error)) return { variant: "error", message: CONNECTION_ERROR_MESSAGE };

  return null;
}
