export interface ParsedSalary {
  min: number | null;
  max: number | null;
  isIncomplete: boolean;
}

/**
 * Convierte el texto con máscara ("Bs 6.500 - 8.000" o "Bs 5.000") en números.
 * Si el rango está a medias ("Bs 6.500 - ") lo marca como incompleto.
 */
export function parseSalary(value: string): ParsedSalary {
  const cleaned = value.replace(/[^\d-]/g, "");
  if (cleaned === "") {
    return { min: null, max: null, isIncomplete: false };
  }

  const parts = cleaned.split("-");
  const min = parts[0] ? Number.parseInt(parts[0], 10) : null;
  const max = parts[1] ? Number.parseInt(parts[1], 10) : null;
  const hasSeparator = parts.length > 1;
  const isIncomplete = parts.length > 2 || (hasSeparator && (min === null || max === null));

  return { min, max, isIncomplete };
}
