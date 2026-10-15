"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { MatchScoreProps } from "../types/match-score.types";

const SIZE_CLASSES = {
  sm: "[&_[data-slot=progress-track]]:h-2",
  md: "[&_[data-slot=progress-track]]:h-3",
  lg: "[&_[data-slot=progress-track]]:h-4",
} as const;

export function MatchScoreBar({ score, showLabel = true, size = "md", className }: MatchScoreProps) {
  const normalizedScore = Number.isFinite(score)
    ? Math.round(Math.min(Math.max(score, 0), 100))
    : 0;

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm font-medium text-foreground">
          <span>Compatibilidad</span>
          <span className="font-semibold">{normalizedScore}%</span>
        </div>
      )}
      <Progress
        value={normalizedScore}
        aria-label="Compatibilidad"
        className={cn("w-full", SIZE_CLASSES[size])}
      />
    </div>
  );
}
