import { BLOCK_STEP_MINUTES } from './create-block.constants.js';

export const MS_PER_MINUTE = 60_000;
export const MS_PER_DAY = 86_400_000;
export const STEP_MS = BLOCK_STEP_MINUTES * MS_PER_MINUTE;

export const BUSY_WEEK_BLOCKS = 50;
export const BUSY_WEEK_BLOCKS_PER_DAY = 8;
export const FALLBACK_TRIO_HOUR = 14;

export const PENDING_APPOINTMENT_MESSAGE = 'Cita de prueba pendiente (seed de desarrollo)';
export const CONFIRMED_APPOINTMENT_MESSAGE = 'Cita de prueba confirmada (seed de desarrollo)';

export const EARLY_MONDAY_WARNING =
  'Ejecución muy temprana en lunes: no se pudo crear el bloque pasado dentro de la ventana 07:00-22:00 de la semana actual.';
export const TRIO_NEXT_WEEK_WARNING =
  'La semana actual ya no tiene horario disponible: los bloques de prueba (libre, pendiente y confirmada) se crearon en la semana siguiente.';
