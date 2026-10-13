export const WORK_EXPERIENCE_COMPANY_NAME_MAX_LENGTH = 100;

export const WORK_EXPERIENCE_POSITION_MAX_LENGTH = 150;

export const WORK_EXPERIENCE_DESCRIPTION_MAX_LENGTH = 2000;

export const WORK_EXPERIENCE_MIN_DATE = "1950-01-01";

export const WORK_EXPERIENCE_VALIDATION_MESSAGES = {
  required: "Este campo es obligatorio.",
  companyNameTooLong: `Usa como máximo ${WORK_EXPERIENCE_COMPANY_NAME_MAX_LENGTH} caracteres.`,
  positionTooLong: `Usa como máximo ${WORK_EXPERIENCE_POSITION_MAX_LENGTH} caracteres.`,
  descriptionTooLong: `Usa como máximo ${WORK_EXPERIENCE_DESCRIPTION_MAX_LENGTH} caracteres.`,
  invalidDate: "Ingresa una fecha válida.",
  dateBeforeMinimum: "La fecha no puede ser anterior al 1 de enero de 1950.",
  futureDate: "La fecha no puede ser posterior a hoy.",
  endDateRequired: "Indica la fecha de fin o marca que trabajas actualmente aquí.",
  endDateBeforeStartDate: "La fecha de fin no puede ser anterior a la fecha de inicio.",
};
