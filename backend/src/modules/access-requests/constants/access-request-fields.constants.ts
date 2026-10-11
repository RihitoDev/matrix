export const MIN_AGE = 18;

export const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?: +[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;

export const DIGITS_REGEX = /^\d+$/;

export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const GRADUATION_YEAR_COHERENCE_MESSAGE = `El año de titulación no puede ser anterior a los ${MIN_AGE} años de edad`;
