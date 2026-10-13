export function formatDecimal(value: number, fractionDigits?: number): string {
  return value.toLocaleString("es-BO", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}
