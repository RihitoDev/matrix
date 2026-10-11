import { EMAIL_PATTERN } from "../constants/validation.constants";

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}
