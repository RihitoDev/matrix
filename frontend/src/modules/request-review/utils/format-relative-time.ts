import { DAY_MS, MINUTE_MS } from "@/shared/constants/date-time.constants";
import { formatDate } from "@/shared/utils/date.utils";

const HOUR_MS = 60 * MINUTE_MS;
const MAX_RELATIVE_DAYS = 30;

export function formatRelativeTime(isoDate: string | null | undefined, now: Date = new Date()): string {
  if (!isoDate) return "Sin fecha";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Sin fecha";

  const elapsed = Math.max(0, now.getTime() - date.getTime());
  if (elapsed < MINUTE_MS) return "hace un momento";
  if (elapsed < HOUR_MS) return `hace ${Math.floor(elapsed / MINUTE_MS)} min`;
  if (elapsed < DAY_MS) return `hace ${Math.floor(elapsed / HOUR_MS)} h`;
  if (elapsed < MAX_RELATIVE_DAYS * DAY_MS) return `hace ${Math.floor(elapsed / DAY_MS)} d`;
  return formatDate(isoDate);
}
