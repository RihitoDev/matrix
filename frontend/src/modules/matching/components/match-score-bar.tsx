"use client";

import { cn } from "@/lib/utils";
import type { MatchScoreProps } from "../types/match-score.types";

const SIZE_CLASSES = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
} as const;

export function MatchScoreBar({ score, showLabel = true, size = "md", className }: MatchScoreProps) {
  const normalizedScore = Math.round(Math.min(Math.max(score, 0), 100));

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm font-medium text-ink">
          <span>Compatibilidad</span>
          <span className="font-semibold">{normalizedScore}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label="Compatibilidad"
        aria-valuenow={normalizedScore}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn("w-full overflow-hidden rounded-full bg-border", SIZE_CLASSES[size])}
      >
        <div
          className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
    </div>
  );
}
