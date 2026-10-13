export const JOB_OFFER_TITLE_MAX_LENGTH = 60;
export const JOB_OFFER_DESCRIPTION_MAX_LENGTH = 3000;
export const JOB_OFFER_LANGUAGES_MAX_LENGTH = 100;
export const JOB_OFFER_MAX_POSITIONS = 500;
export const JOB_OFFER_MAX_SKILLS = 10;

export const JOB_OFFER_TITLE_REGEX = /^[a-zA-Z0-9\sÁÉÍÓÚÜÑáéíóúüñ]+$/;

export const GOOGLE_MAPS_LINK_REGEX =
  /^https:\/\/(maps\.google\.com\/|www\.google\.com\/maps|goo\.gl\/maps\/|maps\.app\.goo\.gl\/)/;

export const JOB_OFFER_VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'Este campo es obligatorio',
  TITLE_TOO_LONG: `El titulo del puesto no debe exceder los ${JOB_OFFER_TITLE_MAX_LENGTH} caracteres`,
  TITLE_INVALID_CHARACTERS: 'Solo se permiten caracteres alfanumericos y espacios',
  DESCRIPTION_TOO_LONG: `La descripcion no debe exceder los ${JOB_OFFER_DESCRIPTION_MAX_LENGTH} caracteres`,
  INVALID_MODALITY: 'Modalidad invalida',
  INVALID_CONTRACT_TYPE: 'Tipo de contrato invalido',
  POSITIONS_NOT_INTEGER: 'Debe ser un numero entero',
  POSITIONS_TOO_FEW: 'Debe ser al menos 1',
  POSITIONS_TOO_MANY: `El numero maximo de vacantes por publicacion es ${JOB_OFFER_MAX_POSITIONS}`,
  SALARY_NOT_POSITIVE: 'El salario debe ser mayor a 0',
  SALARY_RANGE_INVALID: 'El salario minimo no puede ser mayor al salario maximo',
  LANGUAGES_TOO_LONG: `Los idiomas no deben exceder los ${JOB_OFFER_LANGUAGES_MAX_LENGTH} caracteres`,
  INVALID_LOCATION_URL: 'Ingresa un enlace valido de Google Maps',
  SKILLS_REQUIRED: 'Debes seleccionar al menos una habilidad requerida',
  SKILLS_TOO_MANY: `No se pueden seleccionar mas de ${JOB_OFFER_MAX_SKILLS} habilidades`,
  INVALID_SKILL_ID: 'El identificador de la habilidad no es valido',
  INVALID_COMPANY_ID: 'El identificador de la empresa no es valido',
} as const;

export const JOB_OFFER_SELECT = {
  id: true,
  title: true,
  description: true,
  category: true,
  positionsAvailable: true,
  salaryRange: true,
  languages: true,
  locationUrl: true,
  expiresAt: true,
  createdAt: true,
  company: { select: { id: true, title: true } },
  modality: { select: { title: true } },
  contractType: { select: { title: true } },
  status: { select: { title: true } },
  skills: {
    select: { skill: { select: { id: true, name: true } } },
    orderBy: { skill: { name: 'asc' } },
  },
} as const;

export const JOB_OFFER_CREATED_SELECT = { id: true, createdAt: true } as const;
