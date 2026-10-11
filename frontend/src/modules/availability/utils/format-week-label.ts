import type { WeekRange } from "@/shared/types/week-range.types";
import { toBoliviaTime } from "@/shared/utils/date-time";
import { MONTH_LABELS } from "../constants/my-availability.constants";

export function formatWeekLabel(weekRange: WeekRange): string {
  const start = toBoliviaTime(weekRange.startAt);
  const end = toBoliviaTime(weekRange.endAt);
  const startMonth = MONTH_LABELS[start.month - 1];
  const endMonth = MONTH_LABELS[end.month - 1];

  const endLabel = `${end.day} de ${endMonth} de ${end.year}`;

  if (start.year !== end.year) {
    return `${start.day} de ${startMonth} de ${start.year} – ${endLabel}`;
  }
  if (start.month !== end.month) {
    return `${start.day} de ${startMonth} – ${endLabel}`;
  }
  return `${start.day} – ${end.day} de ${endMonth} de ${end.year}`;
}
