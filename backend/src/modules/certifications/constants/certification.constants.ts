export const CERTIFICATION_NAME_MAX_LENGTH = 150;

export const ISSUING_ORGANIZATION_MAX_LENGTH = 100;

export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const CERTIFICATION_VALIDATION_MESSAGES = {
  required: 'Este campo es obligatorio.',
  nameTooLong: `Usa como máximo ${CERTIFICATION_NAME_MAX_LENGTH} caracteres.`,
  organizationTooLong: `Usa como máximo ${ISSUING_ORGANIZATION_MAX_LENGTH} caracteres.`,
  invalidDate: 'Ingresa una fecha válida.',
  futureDate: 'La fecha de emisión no puede ser futura.',
};
