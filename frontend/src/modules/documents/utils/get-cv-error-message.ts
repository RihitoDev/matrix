import {
  CV_CORRUPTED_FILE_ERROR_CODE,
  CV_CORRUPTED_FILE_MESSAGE,
  CV_ERROR_MESSAGES_BY_STATUS,
} from "../constants/cv-error-messages.constants";
import type { CvErrorResponse } from "../types/cv-error-response.types";
import { getHttpStatus } from "@/modules/profile/utils/get-http-status";

function getErrorCode(error: unknown): unknown {
  return (error as CvErrorResponse).response?.data?.data?.code;
}

export function getCvErrorMessage(error: unknown, fallbackMessage: string): string {
  const status = getHttpStatus(error);

  if (status === undefined) {
    return fallbackMessage;
  }

  if (getErrorCode(error) === CV_CORRUPTED_FILE_ERROR_CODE) {
    return CV_CORRUPTED_FILE_MESSAGE;
  }

  return CV_ERROR_MESSAGES_BY_STATUS[status] ?? fallbackMessage;
}
