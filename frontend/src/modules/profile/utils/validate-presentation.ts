import {
  ABOUT_ME_MAX_LENGTH,
  HEADLINE_MAX_LENGTH,
  PROFILE_VALIDATION_MESSAGES,
} from "../constants/profile-validation.constants";
import type { PresentationErrors } from "../types/presentation-errors.types";
import type { PresentationValues } from "../types/presentation-values.types";

export function validatePresentation(values: PresentationValues): PresentationErrors {
  const errors: PresentationErrors = {};

  if (!values.headline) {
    errors.headline = PROFILE_VALIDATION_MESSAGES.required;
  } else if (values.headline.length > HEADLINE_MAX_LENGTH) {
    errors.headline = PROFILE_VALIDATION_MESSAGES.headlineTooLong;
  }

  if (!values.aboutMe) {
    errors.aboutMe = PROFILE_VALIDATION_MESSAGES.required;
  } else if (values.aboutMe.length > ABOUT_ME_MAX_LENGTH) {
    errors.aboutMe = PROFILE_VALIDATION_MESSAGES.aboutMeTooLong;
  }

  return errors;
}
