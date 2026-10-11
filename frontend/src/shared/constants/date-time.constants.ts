export const BOLIVIA_UTC_OFFSET_MINUTES = -240;

export const MINUTE_MS = 60_000;
export const DAY_MS = 24 * 60 * MINUTE_MS;
export const WEEK_MS = 7 * DAY_MS;
export const BOLIVIA_OFFSET_MS = BOLIVIA_UTC_OFFSET_MINUTES * MINUTE_MS;

export const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
export const TIME_PATTERN = /^(\d{2}):(\d{2})$/;

export const BOLIVIA_TIME_LABEL = "Hora de Bolivia (GMT-4)";
