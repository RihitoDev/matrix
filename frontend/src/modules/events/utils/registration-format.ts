export function formatRegistrationDate(date: string | null | undefined) {
  const value = date ? new Date(date) : null;
  if (!value || !Number.isFinite(value.getTime())) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(value);
}

export function formatRegistrationTime(time: string | null | undefined) {
  if (!time) return 'Horario no disponible';
  const clock = /^(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/.exec(time);
  if (clock) {
    if (
      Number(clock[1]) > 23 ||
      Number(clock[2]) > 59 ||
      Number(clock[3] ?? 0) > 59
    )
      return 'Horario no disponible';
    return `${clock[1]}:${clock[2]}`;
  }
  const value = new Date(time);
  if (!Number.isFinite(value.getTime())) return 'Horario no disponible';
  return new Intl.DateTimeFormat('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'UTC',
  }).format(value);
}
