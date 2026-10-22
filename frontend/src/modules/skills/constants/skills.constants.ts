export const SKILLS_CATALOG_ENDPOINT = "/skills";

export const CUSTOM_SKILL_ENDPOINT = "/skills/custom";

export const MY_SKILLS_ENDPOINT = "/profile/me/skills";

export const PENDING_SKILL_ID_PREFIX = "pending-";

export const SKILL_NAME_MAX_LENGTH = 50;

export const SKILL_NAME_ALLOWED_CHARACTERS_REGEX = /^[\p{L}\p{N} +#.\-_/&()]+$/u;

export const SKILL_NAME_LETTER_REGEX = /\p{L}/u;

export const SKILL_NAME_REPEATED_CHARACTER_REGEX = /(.)\1{3,}/iu;

export const CUSTOM_SKILL_HINT_ID = "custom-skill-hint";

export const CUSTOM_SKILL_HINT = `Máximo ${SKILL_NAME_MAX_LENGTH} caracteres.`;

export const SKILLS_ERROR_MESSAGES = {
  load: "No se pudieron cargar tus habilidades. Intenta de nuevo más tarde.",
  save: "No se pudieron guardar tus habilidades. Intenta de nuevo.",
} as const;

export const SKILLS_ERROR_MESSAGES_BY_STATUS: Record<number, string> = {
  400: "Revisa las habilidades seleccionadas e intenta de nuevo.",
  401: "Tu sesión no es válida. Inicia sesión nuevamente.",
  404: "Alguna habilidad ya no está disponible. Recarga la página.",
  409: "No puedes agregar la misma habilidad dos veces.",
};

export const SKILLS_SUCCESS_MESSAGES = {
  saved: "Tus habilidades se guardaron correctamente.",
} as const;

export const SKILLS_VALIDATION_MESSAGES = {
  emptyName: "El nombre no puede estar vacío.",
  tooLong: `El nombre no puede superar los ${SKILL_NAME_MAX_LENGTH} caracteres.`,
  invalidCharacters: "Usa solo letras, números, espacios y los símbolos + # . - _ / & ( ).",
  missingLetter: "El nombre debe contener al menos una letra.",
  repeatedCharacters: "El nombre no puede repetir el mismo carácter más de 3 veces seguidas.",
  duplicated: "Esta habilidad ya existe en el catálogo o en tus habilidades.",
} as const;

export const SKILLS_UI_TEXTS = {
  pageTitle: "Habilidades",
  pageDescription: "Selecciona tecnologías y herramientas que dominas o agrega las tuyas.",
  searchCardTitle: "Buscar en el catálogo",
  mySkillsTitle: "Mis habilidades",
  mySkillsDescription: "Se mostrarán como etiquetas en tu perfil.",
  mySkillsNote: "Al guardar, también podrán usarse en los filtros del directorio.",
  emptySelected: "No tienes habilidades seleccionadas aún.",
  searchLabel: "Tecnología o herramienta",
  searchPlaceholder: "Buscar por nombre, por ejemplo: Python",
  suggestionsTitle: "Sugerencias",
  emptyCatalog: "No se encontraron coincidencias en el catálogo.",
  customSkillLabel: "¿No encuentras la habilidad?",
  customSkillDescription: "Escribe una propia y agrégala a tu perfil.",
  addButton: "Crear habilidad",
  addCatalogButton: "Añadir",
  addedCatalogButton: "Agregada",
  saveButton: "Guardar habilidades",
  savingButton: "Guardando...",
  retryButton: "Reintentar",
  loadingText: "Cargando habilidades...",
  removeAriaLabel: (name: string) => `Quitar ${name}`,
} as const;
