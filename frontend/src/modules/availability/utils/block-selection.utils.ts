import { MINUTE_MS } from "@/shared/constants/date-time.constants";
import { toBoliviaTime } from "@/shared/utils/date-time";
import { formatLongDate } from "./calendar-date";

export const formatBlockDate = (startAt: string): string => formatLongDate(toBoliviaTime(startAt).date);

export const getBlockDurationMinutes = (startAt: string, endAt: string): number =>
  Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / MINUTE_MS);
