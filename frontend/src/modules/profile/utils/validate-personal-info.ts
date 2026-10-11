import { NAME_MAX_LENGTH, PROFILE_VALIDATION_MESSAGES } from "../constants/profile-validation.constants";
import type { PersonalInfoErrors } from "../types/personal-info-errors.types";
import type { PersonalInfoValues } from "../types/personal-info-values.types";
import { isValidEmail } from "./is-valid-email";
import { isValidPhone } from "./is-valid-phone";

function validateName(name: string): string | undefined {
  if (!name) {
    return PROFILE_VALIDATION_MESSAGES.required;
  }

  if (name.length > NAME_MAX_LENGTH) {
    return PROFILE_VALIDATION_MESSAGES.nameTooLong;
  }

  return undefined;
}

export function validatePersonalInfo(values: PersonalInfoValues): PersonalInfoErrors {
  const errors: PersonalInfoErrors = {};

  const firstNameError = validateName(values.firstName);
  if (firstNameError) {
    errors.firstName = firstNameError;
  }

  const lastNameError = validateName(values.lastName);
  if (lastNameError) {
    errors.lastName = lastNameError;
  }

  if (!values.cityId) {
    errors.cityId = PROFILE_VALIDATION_MESSAGES.cityRequired;
  }

  if (!values.phone) {
    errors.phone = PROFILE_VALIDATION_MESSAGES.required;
  } else if (!isValidPhone(values.phone)) {
    errors.phone = PROFILE_VALIDATION_MESSAGES.invalidPhone;
  }

  if (!values.personalEmail) {
    errors.personalEmail = PROFILE_VALIDATION_MESSAGES.required;
  } else if (!isValidEmail(values.personalEmail)) {
    errors.personalEmail = PROFILE_VALIDATION_MESSAGES.invalidEmail;
  }

  return errors;
}
