import { CV_ERROR_MESSAGES_BY_STATUS } from "../constants/cv-error-messages.constants";
import type { HttpError } from "@/modules/profile/types/http-error.types";

export function getCvErrorMessage(error: unknown, fallbackMessage: string): string {
  if (typeof error !== "object" || error === null) {
    return fallbackMessage;
  }

  const status = (error as HttpError).response?.status;

  if (typeof status !== "number") {
    return fallbackMessage;
  }

  return CV_ERROR_MESSAGES_BY_STATUS[status] ?? fallbackMessage;
}
