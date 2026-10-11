import {
  WORK_EXPERIENCE_COMPANY_NAME_MAX_LENGTH,
  WORK_EXPERIENCE_VALIDATION_MESSAGES,
} from "../constants/work-experience-validation.constants";
import type { WorkExperienceErrors } from "../types/work-experience-errors.types";
import type { WorkExperienceFormValues } from "../types/work-experience-form-values.types";

export function validateWorkExperience(values: WorkExperienceFormValues): WorkExperienceErrors {
  const errors: WorkExperienceErrors = {};
  const companyName = (values.companyName ?? "").trim();
  const position = (values.position ?? "").trim();

  if (!companyName) {
    errors.companyName = WORK_EXPERIENCE_VALIDATION_MESSAGES.required;
  } else if (companyName.length > WORK_EXPERIENCE_COMPANY_NAME_MAX_LENGTH) {
    errors.companyName = WORK_EXPERIENCE_VALIDATION_MESSAGES.companyNameTooLong;
  }

  if (!position) {
    errors.position = WORK_EXPERIENCE_VALIDATION_MESSAGES.required;
  }

  if (!values.startDate) {
    errors.startDate = WORK_EXPERIENCE_VALIDATION_MESSAGES.required;
  }

  if (!values.isCurrent) {
    if (!values.endDate) {
      errors.endDate = WORK_EXPERIENCE_VALIDATION_MESSAGES.endDateRequired;
    } else if (values.startDate && values.endDate < values.startDate) {
      errors.endDate = WORK_EXPERIENCE_VALIDATION_MESSAGES.endDateBeforeStartDate;
    }
  }

  return errors;
}
