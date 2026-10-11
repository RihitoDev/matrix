export const WORK_EXPERIENCE_COMPANY_NAME_MAX_LENGTH = 100;

export const WORK_EXPERIENCE_VALIDATION_MESSAGES = {
  required: "Este campo es obligatorio.",
  companyNameTooLong: `Usa como máximo ${WORK_EXPERIENCE_COMPANY_NAME_MAX_LENGTH} caracteres.`,
  endDateRequired: "Indica la fecha de fin o marca que trabajas actualmente aquí.",
  endDateBeforeStartDate: "La fecha de fin no puede ser anterior a la fecha de inicio.",
};
