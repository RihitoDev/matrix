import { PROFILE_ERROR_MESSAGES_BY_STATUS } from "../constants/profile-feedback.constants";
import { getHttpStatus } from "./get-http-status";

export function getProfileErrorMessage(error: unknown, fallbackMessage: string): string {
  const status = getHttpStatus(error);
  return (status && PROFILE_ERROR_MESSAGES_BY_STATUS[status]) || fallbackMessage;
}
