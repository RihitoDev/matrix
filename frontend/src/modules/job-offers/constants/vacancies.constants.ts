export const MODALITIES = ["Presencial", "Remoto", "Híbrido"] as const;
export const CONTRACT_TYPES = ["Tiempo completo", "Medio tiempo", "Pasantía"] as const;

export const MAX_TITLE_CHARS = 60;
export const MAX_LANGUAGES_CHARS = 100;
export const MAX_DESCRIPTION_CHARS = 3000;
export const MAX_VACANCIES = 500;
export const MAX_SKILLS = 10;
export const DESCRIPTION_PREVIEW_CHARS = 125;

export const TITLE_ALLOWED_REGEX = /^[a-zA-Z0-9\sÁÉÍÓÚÜÑáéíóúüñ]+$/;
export const TITLE_DISALLOWED_CHARS_REGEX = /[^a-zA-Z0-9\sÁÉÍÓÚÜÑáéíóúüñ]/g;
export const GOOGLE_MAPS_LINK_REGEX =
  /^https:\/\/(maps\.google\.com\/|www\.google\.com\/maps|goo\.gl\/maps\/|maps\.app\.goo\.gl\/)/;

export const EDITING_KEYS = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];

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

export const SKILL_SEARCH_TEXT = {
  trigger: "+ Añadir habilidad",
  title: "Buscar habilidad",
  description: "Busca una tecnología y selecciónala de los resultados.",
  label: "Buscar tecnología",
  placeholder: "Escribe una tecnología",
  noResults: "No se encontraron coincidencias en el catálogo.",
  alreadySelected: "Ya seleccionada",
  cancel: "Cancelar",
  confirm: "Añadir habilidad",
} as const;

export const DISCARD_DIALOG_TEXT = {
  title: "¿Descartar los cambios?",
  description: "Se perderán los datos de la vacante que no fueron publicados.",
  cancel: "Seguir editando",
  confirm: "Descartar",
} as const;

export const LEAVE_DIALOG_TEXT = {
  title: "¿Salir sin publicar?",
  description: "Los datos de la vacante que no fueron publicados se perderán si sales de esta página.",
  cancel: "Quedarme",
  confirm: "Salir",
} as const;

export const PUBLISHED_DIALOG_TEXT = {
  title: "Vacante publicada",
  description: "Tu vacante se publicó correctamente.",
  confirm: "Aceptar",
} as const;

export const JOB_OFFERS_QUERY_KEYS = {
  skillCatalog: ["job-offers", "skill-catalog"] as const,
};

export const DEFAULT_COMPANY_NAME = "TechBolivia S.R.L.";
