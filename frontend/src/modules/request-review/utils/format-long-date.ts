const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

// "22 de septiembre de 2026, 09:14" en hora de Bolivia (UTC-4, sin horario de verano)
export function formatLongDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const local = new Date(date.getTime() - 4 * 3_600_000);
  const hh = String(local.getUTCHours()).padStart(2, "0");
  const mm = String(local.getUTCMinutes()).padStart(2, "0");
  return `${local.getUTCDate()} de ${MONTHS[local.getUTCMonth()]} de ${local.getUTCFullYear()}, ${hh}:${mm}`;
}

// "22 sep, 09:14" para el historial
export function formatShortDate(iso: string | null | undefined): string | null {
  const long = formatLongDate(iso);
  if (!long || !iso) return null;
  const local = new Date(new Date(iso).getTime() - 4 * 3_600_000);
  const hh = String(local.getUTCHours()).padStart(2, "0");
  const mm = String(local.getUTCMinutes()).padStart(2, "0");
  return `${local.getUTCDate()} ${MONTHS[local.getUTCMonth()].slice(0, 3)}, ${hh}:${mm}`;
}
