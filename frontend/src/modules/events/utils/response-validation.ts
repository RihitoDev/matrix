function invalidResponse(): never {
  throw new Error('La respuesta del backend no es válida.');
}

export function readRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    invalidResponse();
  return value as Record<string, unknown>;
}
export function readString(value: unknown): string {
  if (typeof value !== 'string') invalidResponse();
  return value;
}
export function readNullableString(value: unknown): string | null {
  return value === null || value === undefined ? null : readString(value);
}
export function readCount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0)
    invalidResponse();
  return value;
}
export function readNullableCount(value: unknown): number | null {
  return value === null ? null : readCount(value);
}
export function readArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) invalidResponse();
  return value;
}
