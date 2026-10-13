import type { AreaScoreBarProps } from "../types/area-detail-components.types";
import { formatDecimal } from "../utils/format-decimal";

const MAX_SCORE = 10;

function toPercent(value: number): string {
  return `${Math.min(Math.max(value / MAX_SCORE, 0), 1) * 100}%`;
}

export function AreaScoreBar({ score, globalAverage }: AreaScoreBarProps) {
  const averageLabel = `Media global ${formatDecimal(globalAverage)}`;

  return (
    <div className="relative mt-2 h-1.5 w-full max-w-56 rounded-full bg-border">
      <div
        className="h-full rounded-full bg-accent"
        style={{ width: toPercent(score) }}
        data-testid="area-score-fill"
        aria-hidden="true"
      />
      <span
        role="img"
        title={averageLabel}
        aria-label={averageLabel}
        className="absolute -top-1 h-3.5 w-0.5 -translate-x-1/2 rounded-full bg-ink-soft"
        style={{ left: toPercent(globalAverage) }}
      />
    </div>
  );
}
