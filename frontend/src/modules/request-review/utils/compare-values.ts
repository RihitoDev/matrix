// Compara sin distinguir mayúsculas, acentos ni espacios repetidos
export function normalizeValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function valuesMatch(declared: string, documentValue: string): boolean {
  const normalized = normalizeValue(documentValue);
  return normalized.length > 0 && normalized === normalizeValue(declared);
}
