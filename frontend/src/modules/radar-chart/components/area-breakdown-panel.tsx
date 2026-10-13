import { useId } from "react";
import { cn } from "@/lib/utils";
import type { AreaLevel } from "../types/area-detail.types";
import type { AreaBreakdownPanelProps } from "../types/radar-profile-components.types";
import { formatDecimal } from "../utils/format-decimal";
import { getAreaLevel } from "../utils/get-area-level";
import { AreaLevelBadge } from "./area-level-badge";
import { RadarCard } from "./radar-card";

const MAX_SCORE = 10;

const BAR_CLASS: Record<AreaLevel, string> = {
  Bajo: "bg-border-strong",
  Medio: "bg-gold",
  Alto: "bg-ink",
  Experto: "bg-accent",
};

function toPercent(score: number): string {
  return `${Math.min(Math.max(score / MAX_SCORE, 0), 1) * 100}%`;
}

export function AreaBreakdownPanel({ areas, average, className }: AreaBreakdownPanelProps) {
  const titleId = useId();

  return (
    <RadarCard as="aside" aria-labelledby={titleId} className={cn("flex flex-col p-6", className)}>
      <h2 id={titleId} className="font-heading text-lg font-semibold tracking-tight text-ink">
        Desglose por área
      </h2>
      <p className="mt-1 text-xs text-text-secondary">Puntuaciones NLP tokenizadas</p>

      <ul className="mt-5 flex flex-col gap-4">
        {areas.map((area) => {
          const level = getAreaLevel(area.score);

          return (
            <li key={area.id} data-testid={`area-breakdown-${area.id}`}>
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                  {area.name}
                </span>
                <AreaLevelBadge level={level} />
                <span className="w-8 text-right font-heading text-base font-semibold text-ink tabular-nums">
                  {formatDecimal(area.score, 1)}
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-border" aria-hidden="true">
                <div
                  className={cn("h-full rounded-full", BAR_CLASS[level])}
                  style={{ width: toPercent(area.score) }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto flex items-baseline justify-between gap-3 border-t border-border pt-4 max-lg:mt-6 lg:pt-5">
        <span className="text-[11px] font-semibold tracking-[0.12em] text-text-secondary uppercase">
          Media global
        </span>
        <p className="whitespace-nowrap">
          <span className="font-heading text-2xl leading-none font-semibold text-accent tabular-nums">
            {formatDecimal(average, 2)}
          </span>{" "}
          <span className="text-sm text-text-secondary">/ 10</span>
        </p>
      </div>
    </RadarCard>
  );
}
