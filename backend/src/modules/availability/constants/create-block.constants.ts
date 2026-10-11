// TODO: confirmar con el PO los pasos de 30 minutos y la duración de los bloques.
export const BLOCK_MIN_HOUR = 7;
export const BLOCK_MAX_HOUR = 22;
export const BLOCK_STEP_MINUTES = 30;

export const CREATE_BLOCK_MESSAGES = {
  invalidDate: 'La fecha y hora no tienen un formato válido',
  endBeforeStart: 'La hora de fin debe ser posterior a la hora de inicio',
  startInPast: 'La hora de inicio ya pasó',
  outOfRange: `El horario debe estar entre las ${String(BLOCK_MIN_HOUR).padStart(2, '0')}:00 y las ${String(BLOCK_MAX_HOUR).padStart(2, '0')}:00`,
  invalidStep: `Las horas deben ir en intervalos de ${BLOCK_STEP_MINUTES} minutos`,
  differentDays: 'El bloque debe empezar y terminar el mismo día',
} as const;

export const OVERLAP_ERROR_CODE = '23P01';
