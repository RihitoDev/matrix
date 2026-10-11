import {
  EDUCATION_DATE_PATTERN,
  EDUCATION_VALIDATION_MESSAGES,
} from "../constants/education-validation.constants";
import type { EducationFormErrors } from "../types/education-form-errors.types";
import type { EducationFormValues } from "../types/education-form-values.types";

function isValidDate(value: string): boolean {
  if (!EDUCATION_DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().startsWith(`${value}T`)
  );
}

export function validateEducationForm(
  values: EducationFormValues,
  allowMissingEndDate = false,
): EducationFormErrors {
  const errors: EducationFormErrors = {};
  if (!(values.institution ?? "").trim()) {
    errors.institution = EDUCATION_VALIDATION_MESSAGES.institutionRequired;
  }
  if (!(values.degree ?? "").trim()) {
    errors.degree = EDUCATION_VALIDATION_MESSAGES.degreeRequired;
  }
  if (!values.startDate) {
    errors.startDate = EDUCATION_VALIDATION_MESSAGES.startDateRequired;
  } else if (!isValidDate(values.startDate)) {
    errors.startDate = EDUCATION_VALIDATION_MESSAGES.invalidDate;
  }
  if (!values.endDate) {
    if (!allowMissingEndDate) {
      errors.endDate = EDUCATION_VALIDATION_MESSAGES.endDateRequired;
    }
  } else if (!isValidDate(values.endDate)) {
    errors.endDate = EDUCATION_VALIDATION_MESSAGES.invalidDate;
  }
  if (
    !errors.startDate &&
    !errors.endDate &&
    values.endDate &&
    values.endDate < values.startDate
  ) {
    errors.endDate = EDUCATION_VALIDATION_MESSAGES.invalidDateRange;
  }
  return errors;
}
