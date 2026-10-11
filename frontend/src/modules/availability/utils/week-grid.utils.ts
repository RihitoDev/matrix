import { DAY_MS } from "@/shared/constants/date-time.constants";
import { toBoliviaTime } from "@/shared/utils/date-time";
import type { WeekRange } from "@/shared/types/week-range.types";
import { HOUR_HEIGHT_PX } from "../constants/week-grid.constants";
import type { AvailabilityBlockState } from "../types/availability-block-state.types";
import type { WeekGridVariant } from "../types/week-grid-variant.types";

export function getWeekDayIndex(startAt: string, weekRange: WeekRange): number | null {
  const startMs = new Date(startAt).getTime();
  const rangeStartMs = new Date(weekRange.startAt).getTime();
  const rangeEndMs = new Date(weekRange.endAt).getTime();
  if (startMs < rangeStartMs || startMs > rangeEndMs) return null;
  return toBoliviaTime(startAt).weekday - 1;
}

export function getBlockVerticalPosition(
  startAt: string,
  endAt: string,
  startHour: number,
  endHour: number
): { topPx: number; heightPx: number } {
  const start = toBoliviaTime(startAt);
  const end = toBoliviaTime(endAt);

  const startMinutes = Math.max(0, (start.hours - startHour) * 60 + start.minutes);
  const endMinutes = Math.min(
    (endHour - startHour) * 60,
    (end.hours - startHour) * 60 + end.minutes
  );

  const pxPerMinute = HOUR_HEIGHT_PX / 60;
  return {
    topPx: startMinutes * pxPerMinute,
    heightPx: Math.max(0, endMinutes - startMinutes) * pxPerMinute,
  };
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function isBlockClickable(variant: WeekGridVariant, state: AvailabilityBlockState): boolean {
  if (variant === "owner") return true;
  return variant === "selectable" && state === "free";
}

export function getWeekDayDates(weekRange: WeekRange): string[] {
  const weekStartMs = new Date(weekRange.startAt).getTime();
  return Array.from({ length: 7 }, (_, dayIndex) =>
    toBoliviaTime(new Date(weekStartMs + dayIndex * DAY_MS)).date
  );
}
