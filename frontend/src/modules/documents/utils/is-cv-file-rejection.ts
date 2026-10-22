import { CV_FILE_REJECTION_STATUSES } from "../constants/cv-error-messages.constants";
import { getHttpStatus } from "@/modules/profile";

export function isCvFileRejection(error: unknown): boolean {
  const status = getHttpStatus(error);
  return status !== undefined && CV_FILE_REJECTION_STATUSES.includes(status);
}
