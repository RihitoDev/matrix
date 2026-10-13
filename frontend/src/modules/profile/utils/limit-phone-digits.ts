import { PHONE_MAX_DIGITS } from "../constants/profile-validation.constants";

const DIGIT_PATTERN = /\d/;

export function limitPhoneDigits(value: string): string {
  let digitCount = 0;
  let limited = "";

  for (const character of value ?? "") {
    if (DIGIT_PATTERN.test(character)) {
      if (digitCount === PHONE_MAX_DIGITS) {
        continue;
      }
      digitCount += 1;
    }
    limited += character;
  }

  return limited;
}
