import {
  CERTIFICATION_NAME_MAX_LENGTH,
  CERTIFICATION_VALIDATION_MESSAGES,
  ISSUING_ORGANIZATION_MAX_LENGTH,
} from "../config/certification-validation.config";
import { BUSINESS_TIMEZONE, ISO_DATE_PATTERN } from "@/modules/profile/constants/validation.constants";
import type { CertificationErrors } from "../types/certification-errors.types";
import type { CreateCertificationDto } from "../types/create-certification-dto.types";

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function getTodayIsoDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function validateCertification(values: CreateCertificationDto): CertificationErrors {
  const errors: CertificationErrors = {};
  const name = (values.name ?? "").trim();
  const issuingOrganization = (values.issuingOrganization ?? "").trim();
  const issueDate = (values.issueDate ?? "").trim();

  if (!name) {
    errors.name = CERTIFICATION_VALIDATION_MESSAGES.required;
  } else if (name.length > CERTIFICATION_NAME_MAX_LENGTH) {
    errors.name = CERTIFICATION_VALIDATION_MESSAGES.nameTooLong;
  } else if (/<[^>]*>/i.test(name)) {
    errors.name = "No se permiten etiquetas HTML ni scripts";
  }

  if (!issuingOrganization) {
    errors.issuingOrganization = CERTIFICATION_VALIDATION_MESSAGES.required;
  } else if (issuingOrganization.length > ISSUING_ORGANIZATION_MAX_LENGTH) {
    errors.issuingOrganization = CERTIFICATION_VALIDATION_MESSAGES.organizationTooLong;
  } else if (/<[^>]*>/i.test(issuingOrganization)) {
    errors.issuingOrganization = "No se permiten etiquetas HTML ni scripts";
  }

  if (!issueDate) {
    errors.issueDate = CERTIFICATION_VALIDATION_MESSAGES.required;
  } else if (!isValidIsoDate(issueDate)) {
    errors.issueDate = CERTIFICATION_VALIDATION_MESSAGES.invalidDate;
  } else if (issueDate > getTodayIsoDate()) {
    errors.issueDate = CERTIFICATION_VALIDATION_MESSAGES.futureDate;
  }

  return errors;
}
