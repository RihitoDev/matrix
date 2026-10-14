import { formatDecimal } from "./format-decimal";

export function formatDurationYears(years: number): string {
  return years === 1 ? "1 año" : `${formatDecimal(years)} años`;
}
