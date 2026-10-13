import type { AreaLevel } from "../types/area-detail.types";

export function getAreaLevel(score: number): AreaLevel {
  if (score < 4) return "Bajo";
  if (score < 6.5) return "Medio";
  if (score < 8.5) return "Alto";
  return "Experto";
}
