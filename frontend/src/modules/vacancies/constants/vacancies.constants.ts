export const MODALITIES = ["Presencial", "Remoto", "Híbrido"] as const;
export const CONTRACT_TYPES = ["Tiempo completo", "Medio tiempo", "Pasantía"] as const;

export const MAX_TITLE_CHARS = 60;
export const MAX_LANGUAGES_CHARS = 100;
export const MAX_DESCRIPTION_CHARS = 3000;
export const MAX_VACANCIES = 500;
export const MAX_SKILLS = 10;
export const DESCRIPTION_PREVIEW_CHARS = 125;

// Mismo criterio que el backend (create-job-offer.schema.ts) y la HU1 (criterio 11).
export const GOOGLE_MAPS_LINK_REGEX = /^https:\/\/(maps\.google\.com\/|www\.google\.com\/maps|goo\.gl\/maps\/|maps\.app\.goo\.gl\/)/;

export const VACANCY_MESSAGES = {
  required: "Este campo es obligatorio",
  invalidMapsLink: "Ingresa un enlace válido de Google Maps",
  minVacancies: "Debe ser al menos 1",
  maxVacancies: "El número máximo de vacantes por publicación es 500",
  salaryMustBePositive: "El salario debe ser mayor a 0",
  salaryRangeInvalid: "El salario mínimo no puede ser mayor al salario máximo",
  salaryIncomplete: "Completa el rango salarial o deja un solo monto",
  skillsRequired: "Debes seleccionar al menos una habilidad requerida",
  skillsLimit: "Alcanzaste el máximo de 10 habilidades por oferta",
} as const;

export const PUBLISH_MESSAGES = {
  network: "Sin conexión a internet. Revisa tu conexión e inténtalo de nuevo.",
  server: "No se pudo completar la publicación. Inténtalo más tarde.",
  validation: "Algunos datos de la vacante no son válidos. Revísalos e inténtalo de nuevo.",
  company: "No encontramos la empresa asociada a tu sesión.",
  session: "Tu sesión no es válida. Inicia sesión nuevamente.",
  noCompany: "No hay una empresa asociada a tu sesión. Inicia sesión como empresa.",
  incompleteForm: "Faltan datos en los pasos anteriores. Vuelve atrás y complétalos.",
} as const;

export const SKILLS_CATALOG_MESSAGES = {
  loading: "Cargando habilidades...",
  error: "No se pudo cargar el catálogo de habilidades.",
  retry: "Reintentar",
} as const;

export const DEFAULT_COMPANY_NAME = "TechBolivia S.R.L.";
