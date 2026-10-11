import { toBoliviaTime } from "@/shared/utils/date-time";
import { DATE_LOCALE } from "../constants/availability.constants";
import { pad } from "./pad";

export const toCalendarDate = (date: string): Date => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const toDateString = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const formatDayAndMonth = (date: string): string => {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day));
  const weekday = value.toLocaleDateString(DATE_LOCALE, { weekday: "long", timeZone: "UTC" });
  const monthName = value.toLocaleDateString(DATE_LOCALE, { month: "long", timeZone: "UTC" });
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${day} de ${monthName}`;
};

export const formatLongDate = (date: string): string =>
  `${formatDayAndMonth(date)} de ${date.split("-")[0]}`;

export const getBoliviaToday = (): Date => toCalendarDate(toBoliviaTime(new Date()).date);
