import type { BlockFormField } from "../types/block-form-field.types";
import type { BlockFormMode } from "../types/block-form-mode.types";
import { pad } from "../utils/pad";

export const DATE_LOCALE = "es-BO";

export const CREATE_BLOCK_ERROR = "Error al crear el bloque de disponibilidad";

export const UPDATE_BLOCK_ERROR = "Error al actualizar el bloque de disponibilidad";
export const BLOCK_LOAD_ERROR = "No se pudo cargar el bloque de disponibilidad";

export const BLOCK_MIN_HOUR = 7;
export const BLOCK_MAX_HOUR = 22;
export const BLOCK_STEP_MINUTES = 30;

export const BLOCK_MESSAGES = {
  endBeforeStart: "La hora de fin debe ser posterior a la hora de inicio",
  startInPast: "La hora de inicio ya pasó",
  outOfRange: `El horario debe estar entre las ${pad(BLOCK_MIN_HOUR)}:00 y las ${pad(BLOCK_MAX_HOUR)}:00`,
  invalidStep: `Las horas deben ir en intervalos de ${BLOCK_STEP_MINUTES} minutos`,
  differentDays: "El bloque debe empezar y terminar el mismo día",
} as const;

export const FORM_TEXT: Record<
  BlockFormMode,
  { title: string; description: string; submit: string; dateLabel: string; startLabel: string; endLabel: string }
> = {
  create: {
    title: "Nuevo bloque de disponibilidad",
    description: "Elige la fecha y el horario en que puedes atender sesiones de mentoría.",
    submit: "Guardar bloque",
    dateLabel: "Fecha",
    startLabel: "Hora de inicio",
    endLabel: "Hora de fin",
  },
  edit: {
    title: "Editar bloque",
    description: "Modifica la fecha o el horario del bloque.",
    submit: "Guardar cambios",
    dateLabel: "Día",
    startLabel: "Desde",
    endLabel: "Hasta",
  },
};

export const EDIT_BLOCK_HINT = "Solo se puede editar si el bloque no tiene ninguna cita asociada.";


export const REQUIRED_MESSAGES: Record<BlockFormField, string> = {
  date: "Selecciona una fecha",
  startAt: "Selecciona la hora de inicio",
  endAt: "Selecciona la hora de fin",
};

export const TIME_OPTIONS: string[] = Array.from(
  { length: ((BLOCK_MAX_HOUR - BLOCK_MIN_HOUR) * 60) / BLOCK_STEP_MINUTES + 1 },
  (_, index) => {
    const minutes = BLOCK_MIN_HOUR * 60 + index * BLOCK_STEP_MINUTES;
    return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
  },
);
