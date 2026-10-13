import { toBoliviaTime } from "@/shared/utils/date-time";

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function formatSubmissionDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    const { day, month, year, time } = toBoliviaTime(iso);
    return `${day} ${MONTHS[month - 1]} ${year}, ${time}`;
  } catch {
    return null;
  }
}
