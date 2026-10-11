const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// Hora de Bolivia fija: el mes se arma con una tabla propia para no depender de los datos de idioma del entorno
const FORMATTER = new Intl.DateTimeFormat("es-BO", {
  timeZone: "America/La_Paz",
  day: "numeric",
  month: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// "2026-10-05T23:59:34.644Z" -> "5 oct 2026, 19:59"; devuelve null si la fecha no es válida
export function formatSubmissionDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const parts = Object.fromEntries(FORMATTER.formatToParts(date).map((part) => [part.type, part.value]));
  const month = MONTHS[Number(parts.month) - 1];
  return `${Number(parts.day)} ${month} ${parts.year}, ${parts.hour}:${parts.minute}`;
}
