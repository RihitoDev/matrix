import { CV_FILE_REJECTION_STATUSES } from "../constants/cv-error-messages.constants";
import { getHttpStatus } from "@/modules/profile/utils/get-http-status";

export function isCvFileRejection(error: unknown): boolean {
  const status = getHttpStatus(error);
  return status !== undefined && CV_FILE_REJECTION_STATUSES.includes(status);
}
