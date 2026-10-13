import {
  WORK_EXPERIENCE_COMPANY_NAME_MAX_LENGTH,
  WORK_EXPERIENCE_DESCRIPTION_MAX_LENGTH,
  WORK_EXPERIENCE_MIN_DATE,
  WORK_EXPERIENCE_POSITION_MAX_LENGTH,
  WORK_EXPERIENCE_VALIDATION_MESSAGES,
} from "../constants/work-experience-validation.constants";
import type { WorkExperienceErrors } from "../types/work-experience-errors.types";
import type { WorkExperienceFormValues } from "../types/work-experience-form-values.types";
import { getTodayIsoDate } from "./get-today-iso-date";
import { isValidIsoDate } from "./is-valid-iso-date";

function getDateError(value: string): string | undefined {
  if (!isValidIsoDate(value)) {
    return WORK_EXPERIENCE_VALIDATION_MESSAGES.invalidDate;
  }
  if (value < WORK_EXPERIENCE_MIN_DATE) {
    return WORK_EXPERIENCE_VALIDATION_MESSAGES.dateBeforeMinimum;
  }
  if (value > getTodayIsoDate()) {
    return WORK_EXPERIENCE_VALIDATION_MESSAGES.futureDate;
  }
  return undefined;
}

export function validateWorkExperience(values: WorkExperienceFormValues): WorkExperienceErrors {
  const errors: WorkExperienceErrors = {};
  const companyName = (values.companyName ?? "").trim();
  const position = (values.position ?? "").trim();
  const description = (values.description ?? "").trim();
  const startDate = values.startDate ?? "";
  const endDate = values.endDate ?? "";

  if (!companyName) {
    errors.companyName = WORK_EXPERIENCE_VALIDATION_MESSAGES.required;
  } else if (companyName.length > WORK_EXPERIENCE_COMPANY_NAME_MAX_LENGTH) {
    errors.companyName = WORK_EXPERIENCE_VALIDATION_MESSAGES.companyNameTooLong;
  }

  if (!position) {
    errors.position = WORK_EXPERIENCE_VALIDATION_MESSAGES.required;
  } else if (position.length > WORK_EXPERIENCE_POSITION_MAX_LENGTH) {
    errors.position = WORK_EXPERIENCE_VALIDATION_MESSAGES.positionTooLong;
  }

  if (description.length > WORK_EXPERIENCE_DESCRIPTION_MAX_LENGTH) {
    errors.description = WORK_EXPERIENCE_VALIDATION_MESSAGES.descriptionTooLong;
  }

  errors.startDate = startDate
    ? getDateError(startDate)
    : WORK_EXPERIENCE_VALIDATION_MESSAGES.required;

  if (!values.isCurrent) {
    if (!endDate) {
      errors.endDate = WORK_EXPERIENCE_VALIDATION_MESSAGES.endDateRequired;
    } else {
      errors.endDate = getDateError(endDate);
      if (!errors.endDate && !errors.startDate && endDate < startDate) {
        errors.endDate = WORK_EXPERIENCE_VALIDATION_MESSAGES.endDateBeforeStartDate;
      }
    }
  }

  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message !== undefined),
  ) as WorkExperienceErrors;
}
