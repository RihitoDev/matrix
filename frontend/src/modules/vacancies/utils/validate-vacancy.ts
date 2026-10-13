import {
  GOOGLE_MAPS_LINK_REGEX,
  MAX_DESCRIPTION_CHARS,
  MAX_LANGUAGES_CHARS,
  MAX_SKILLS,
  MAX_TITLE_CHARS,
  MAX_VACANCIES,
  VACANCY_MESSAGES,
} from "../constants/vacancies.constants";
import type { VacancyConditions, VacancyErrors } from "../hooks/use-job-offer-form";
import { parseSalary } from "./parse-salary";

/** Orden visual del paso 1: se usa para hacer scroll al primer campo con error. */
export const INFORMATION_FIELDS_ORDER: (keyof VacancyConditions)[] = [
  "title",
  "modality",
  "mapsLink",
  "contractType",
  "category",
  "vacancyCount",
  "salary",
  "languages",
];

const TITLE_REGEX = /^[a-zA-Z0-9\sÁÉÍÓÚÜÑáéíóúüñ]+$/;

export function isFieldEmpty(field: keyof VacancyConditions, conditions: VacancyConditions): boolean {
  if (field === "modality") return conditions.modality === null;
  if (field === "skills") return conditions.skills.length === 0;
  return (conditions[field] as string).trim() === "";
}

function validateSalary(value: string): string | undefined {
  const salary = parseSalary(value);
  if (salary.isIncomplete) return VACANCY_MESSAGES.salaryIncomplete;
  if (salary.min === null || salary.min <= 0) return VACANCY_MESSAGES.salaryMustBePositive;
  if (salary.max !== null && salary.min > salary.max) return VACANCY_MESSAGES.salaryRangeInvalid;
  return undefined;
}

function validateVacancyCount(value: string): string | undefined {
  const count = Number(value.trim());
  if (!Number.isInteger(count) || count < 1) return VACANCY_MESSAGES.minVacancies;
  if (count > MAX_VACANCIES) return VACANCY_MESSAGES.maxVacancies;
  return undefined;
}

/** Valida el paso 1 "Información y condiciones". Devuelve un error por campo inválido. */
export function validateInformation(conditions: VacancyConditions): VacancyErrors {
  const errors: VacancyErrors = {};

  for (const field of INFORMATION_FIELDS_ORDER) {
    if (isFieldEmpty(field, conditions)) {
      errors[field] = VACANCY_MESSAGES.required;
    }
  }

  const title = conditions.title.trim();
  if (!errors.title && title.length > MAX_TITLE_CHARS) {
    errors.title = `El título no debe exceder los ${MAX_TITLE_CHARS} caracteres`;
  } else if (!errors.title && !TITLE_REGEX.test(title)) {
    errors.title = "Solo se permiten caracteres alfanuméricos y espacios";
  }

  if (!errors.mapsLink && !GOOGLE_MAPS_LINK_REGEX.test(conditions.mapsLink.trim())) {
    errors.mapsLink = VACANCY_MESSAGES.invalidMapsLink;
  }

  if (!errors.vacancyCount) {
    const message = validateVacancyCount(conditions.vacancyCount);
    if (message) errors.vacancyCount = message;
  }

  if (!errors.salary) {
    const message = validateSalary(conditions.salary);
    if (message) errors.salary = message;
  }

  if (!errors.languages && conditions.languages.trim().length > MAX_LANGUAGES_CHARS) {
    errors.languages = `Los idiomas no deben exceder los ${MAX_LANGUAGES_CHARS} caracteres`;
  }

  return errors;
}

/** Valida el paso 2 "Descripción y requisitos". */
export function validateRequirements(conditions: VacancyConditions): VacancyErrors {
  const errors: VacancyErrors = {};

  if (isFieldEmpty("description", conditions)) {
    errors.description = VACANCY_MESSAGES.required;
  } else if (conditions.description.trim().length > MAX_DESCRIPTION_CHARS) {
    errors.description = `La descripción no debe exceder los ${MAX_DESCRIPTION_CHARS} caracteres`;
  }

  if (conditions.skills.length === 0) {
    errors.skills = VACANCY_MESSAGES.skillsRequired;
  } else if (conditions.skills.length > MAX_SKILLS) {
    errors.skills = VACANCY_MESSAGES.skillsLimit;
  }

  return errors;
}
