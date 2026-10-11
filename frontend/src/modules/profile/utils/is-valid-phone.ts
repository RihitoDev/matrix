import { PHONE_MAX_DIGITS, PHONE_MIN_DIGITS } from "../constants/profile-validation.constants";
import { PHONE_PATTERN } from "../constants/validation.constants";

export function isValidPhone(phone: string): boolean {
  if (!PHONE_PATTERN.test(phone)) {
    return false;
  }

  const digitCount = phone.replace(/\D/g, "").length;
  return digitCount >= PHONE_MIN_DIGITS && digitCount <= PHONE_MAX_DIGITS;
}
