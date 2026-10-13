import {
  EDUCATION_DATE_PATTERN,
  EDUCATION_MIN_DATE,
  EDUCATION_DESCRIPTION_MAX_LENGTH,
  EDUCATION_VALIDATION_MESSAGES,
} from "../constants/education-validation.constants";
import type { EducationFormErrors } from "../types/education-form-errors.types";
import type { EducationFormValues } from "../types/education-form-values.types";
import type { EducationInstitution } from "../types/education-institution.types";
import { resolveEducationInstitution } from "./resolve-education-institution";
import { getEducationDegrees, resolveEducationDegree } from "./resolve-education-degree";

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
  institutions: readonly EducationInstitution[] = [],
): EducationFormErrors {
  const errors: EducationFormErrors = {};
  if ((values.description ?? "").length > EDUCATION_DESCRIPTION_MAX_LENGTH) {
    errors.description = EDUCATION_VALIDATION_MESSAGES.descriptionTooLong;
  }
  if (!(values.institution ?? "").trim()) {
    errors.institution = EDUCATION_VALIDATION_MESSAGES.institutionRequired;
  } else if (!resolveEducationInstitution(values.institution, institutions)) {
    errors.institution = EDUCATION_VALIDATION_MESSAGES.institutionInvalid;
  }
  if (!(values.degree ?? "").trim()) {
    errors.degree = EDUCATION_VALIDATION_MESSAGES.degreeRequired;
  } else if (!errors.institution && !resolveEducationDegree(values.degree,
    getEducationDegrees(resolveEducationInstitution(values.institution, institutions) ?? ''))) {
    errors.degree = EDUCATION_VALIDATION_MESSAGES.degreeInvalid;
  }
  if (!values.startDate) {
    errors.startDate = EDUCATION_VALIDATION_MESSAGES.startDateRequired;
  } else if (!isValidDate(values.startDate)) {
    errors.startDate = EDUCATION_VALIDATION_MESSAGES.invalidDate;
  } else if (values.startDate < EDUCATION_MIN_DATE) {
    errors.startDate = EDUCATION_VALIDATION_MESSAGES.dateTooEarly;
  }
  if (!values.endDate) {
    if (!allowMissingEndDate) {
      errors.endDate = EDUCATION_VALIDATION_MESSAGES.endDateRequired;
    }
  } else if (!isValidDate(values.endDate)) {
    errors.endDate = EDUCATION_VALIDATION_MESSAGES.invalidDate;
  } else if (values.endDate < EDUCATION_MIN_DATE) {
    errors.endDate = EDUCATION_VALIDATION_MESSAGES.dateTooEarly;
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
