import { formatDecimal } from "./format-decimal";

export function formatGap(gap: number): string {
  if (gap === 0) return formatDecimal(0, 1);

  const value = formatDecimal(gap, 1);

  return gap > 0 ? `+${value}` : value;
}
