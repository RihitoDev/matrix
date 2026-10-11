export const NAME_MAX_LENGTH = 100;

export const HEADLINE_MAX_LENGTH = 150;

export const ABOUT_ME_MAX_LENGTH = 2000;

export const PHONE_MIN_DIGITS = 7;

export const PHONE_MAX_DIGITS = 15;

export const PROFILE_VALIDATION_MESSAGES = {
  required: "Este campo es obligatorio.",
  cityRequired: "Selecciona tu ciudad de residencia.",
  nameTooLong: `Usa como máximo ${NAME_MAX_LENGTH} caracteres.`,
  headlineTooLong: `Usa como máximo ${HEADLINE_MAX_LENGTH} caracteres.`,
  aboutMeTooLong: `Usa como máximo ${ABOUT_ME_MAX_LENGTH} caracteres.`,
  invalidPhone: `Ingresa un teléfono válido de ${PHONE_MIN_DIGITS} a ${PHONE_MAX_DIGITS} dígitos.`,
  invalidEmail: "Ingresa un correo válido, por ejemplo nombre@correo.com.",
};

// The backend answers field errors in English; the form shows these Spanish texts instead.
export const PROFILE_SERVER_FIELD_MESSAGES = {
  firstName: `Ingresa tus nombres con hasta ${NAME_MAX_LENGTH} caracteres.`,
  lastName: `Ingresa tus apellidos con hasta ${NAME_MAX_LENGTH} caracteres.`,
  cityId: "Selecciona una ciudad válida.",
  phone: PROFILE_VALIDATION_MESSAGES.invalidPhone,
  personalEmail: PROFILE_VALIDATION_MESSAGES.invalidEmail,
  headline: `Ingresa un titular con hasta ${HEADLINE_MAX_LENGTH} caracteres.`,
  aboutMe: `Escribe tu presentación con hasta ${ABOUT_ME_MAX_LENGTH} caracteres.`,
};
