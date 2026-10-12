import { isAxiosError } from "axios";
import { EDUCATION_FEEDBACK_MESSAGES } from "../constants/education-feedback.constants";
import { EDUCATION_CONFLICT_STATUS, EDUCATION_DUPLICATE_CODE, EDUCATION_WRITE_CONFLICT_CODE } from "../constants/education-http.constants";

export function getEducationSaveError(error: unknown): string | undefined {
  if (!isAxiosError(error) || error.response?.status !== EDUCATION_CONFLICT_STATUS) return undefined;
  const code: unknown = error.response?.data?.data?.code;
  if (code === EDUCATION_DUPLICATE_CODE) return EDUCATION_FEEDBACK_MESSAGES.duplicate;
  if (code === EDUCATION_WRITE_CONFLICT_CODE) return EDUCATION_FEEDBACK_MESSAGES.writeConflict;
  return undefined;
}
