export const MAX_WEEK_QUERY_DAYS = 7;
export const MAX_WEEK_QUERY_MS = MAX_WEEK_QUERY_DAYS * 24 * 60 * 60 * 1000;

export const WEEK_QUERY_MESSAGES = {
  invalidDate: 'La fecha y hora no tienen un formato válido',
  toBeforeFrom: 'La fecha final debe ser posterior a la fecha inicial',
  rangeTooLong: `El rango de fechas no puede superar los ${MAX_WEEK_QUERY_DAYS} días`,
} as const;
