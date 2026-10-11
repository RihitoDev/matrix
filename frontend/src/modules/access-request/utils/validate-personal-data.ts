import { CAREERS } from "../constants/careers.constants";
import { ID_CARD_ISSUED_IN } from "../constants/id-card-issued-in.constants";
import type { FieldErrors, PersonalDataValues } from "../types/access-request.types";

export const MIN_AGE = 18;

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?: [A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;
const DIGITS_REGEX = /^\d+$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Se compara el viaje de ida y vuelta para rechazar fechas como 2000-02-30
function isRealIsoDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isAdult(birthDate: string, now: Date): boolean {
  const cutoff = Date.UTC(now.getUTCFullYear() - MIN_AGE, now.getUTCMonth(), now.getUTCDate());
  return new Date(`${birthDate}T00:00:00.000Z`).getTime() <= cutoff;
}

function validateName(value: string, label: string): string | undefined {
  const text = value.trim();
  if (text.length === 0) return `${label} son obligatorios`;
  if (text.length > 100) return `${label} no pueden superar los 100 caracteres`;
  if (!NAME_REGEX.test(text)) return `${label} solo pueden contener letras y espacios`;
}

function validateDigits(value: string, label: string): string | undefined {
  const text = value.trim();
  if (text.length === 0) return `${label} es obligatorio`;
  if (text.length > 20) return `${label} no puede superar los 20 dígitos`;
  if (!DIGITS_REGEX.test(text)) return `${label} solo puede contener dígitos`;
}

function validateEmail(value: string): string | undefined {
  const text = value.trim().toLowerCase();
  if (text.length === 0) return "El correo es obligatorio";
  if (text.length > 150) return "El correo no puede superar los 150 caracteres";
  if (!EMAIL_REGEX.test(text)) return "El correo no tiene un formato válido";
}

function validateBirthDate(value: string, now: Date): string | undefined {
  const text = value.trim();
  if (text.length === 0) return "La fecha de nacimiento es obligatoria";
  if (!ISO_DATE_REGEX.test(text)) return "La fecha de nacimiento debe tener el formato AAAA-MM-DD";
  if (!isRealIsoDate(text)) return "La fecha de nacimiento no es válida";
  if (!isAdult(text, now)) return `Debes ser mayor de ${MIN_AGE} años`;
}

function validateGraduationYear(value: string, now: Date): string | undefined {
  const text = value.trim();
  if (text.length === 0) return "El año de titulación es obligatorio";
  if (!DIGITS_REGEX.test(text)) return "El año de titulación debe ser un número entero";
  if (Number(text) > now.getUTCFullYear()) return "El año de titulación no puede ser futuro";
}

// Devuelve solo los campos con error; un objeto vacío significa que todo es válido
export function validatePersonalData(values: PersonalDataValues, now: Date = new Date()): FieldErrors {
  const errors: FieldErrors = {};
  const assign = (field: keyof FieldErrors, message: string | undefined) => {
    if (message) errors[field] = message;
  };

  assign("firstName", validateName(values.firstName, "Los nombres"));
  assign("lastName", validateName(values.lastName, "Los apellidos"));
  assign("idCardNumber", validateDigits(values.idCardNumber, "El carnet de identidad"));
  assign(
    "idCardIssuedIn",
    (ID_CARD_ISSUED_IN as readonly string[]).includes(values.idCardIssuedIn)
      ? undefined
      : "El departamento de expedición no es válido",
  );
  assign("sisCode", validateDigits(values.sisCode, "El código SIS"));
  assign("email", validateEmail(values.email));

  const phone = (values.phone ?? "").trim();
  if (phone.length > 0 && !/^\d{6,8}$/.test(phone)) {
    errors.phone = "El teléfono debe tener entre 6 y 8 dígitos";
  }

  assign("birthDate", validateBirthDate(values.birthDate, now));
  assign("graduationYear", validateGraduationYear(values.graduationYear, now));
  assign(
    "career",
    (CAREERS as readonly string[]).includes(values.career) ? undefined : "La carrera no es válida",
  );

  // La coherencia solo se evalúa si ambos campos son válidos por separado
  if (!errors.birthDate && !errors.graduationYear) {
    const birthYear = Number(values.birthDate.trim().slice(0, 4));
    if (Number(values.graduationYear.trim()) < birthYear + MIN_AGE) {
      errors.graduationYear = `El año de titulación no puede ser anterior a los ${MIN_AGE} años de edad`;
    }
  }

  return errors;
}
