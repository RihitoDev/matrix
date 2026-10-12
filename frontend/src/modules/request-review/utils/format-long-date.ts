import { toBoliviaTime } from "@/shared/utils/date-time";

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function parseBoliviaTime(iso: string | null | undefined) {
  if (!iso) return null;
  try {
    return toBoliviaTime(iso);
  } catch {
    return null;
  }
}

export function formatLongDate(iso: string | null | undefined): string | null {
  const time = parseBoliviaTime(iso);
  if (!time) return null;
  return `${time.day} de ${MONTHS[time.month - 1]} de ${time.year}, ${time.time}`;
}

export function formatShortDate(iso: string | null | undefined): string | null {
  const time = parseBoliviaTime(iso);
  if (!time) return null;
  return `${time.day} ${MONTHS[time.month - 1].slice(0, 3)}, ${time.time}`;
}
