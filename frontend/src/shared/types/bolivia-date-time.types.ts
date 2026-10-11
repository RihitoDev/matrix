export interface BoliviaDateTime {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  // ISO 8601: 1 = lunes, 7 = domingo.
  weekday: number;
  date: string;
  time: string;
}
