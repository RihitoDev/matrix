import { cn } from "@/lib/utils";
import type { AreaLevelBadgeProps } from "../types/area-detail-components.types";
import type { AreaLevel } from "../types/area-detail.types";

const BADGE_CLASS: Record<AreaLevel, string> = {
  Bajo: "border-transparent text-text-secondary",
  Medio:
    "border-transparent text-ink-soft",
  Alto: "border-transparent text-ink",
  Experto: "border-transparent font-bold text-ink",
};

const DOT_CLASS: Record<AreaLevel, string> = {
  Bajo: "bg-border-strong",
  Medio: "bg-ink-soft",
  Alto: "bg-ink-soft",
  Experto: "bg-ink",
};

export function AreaLevelBadge({ level }: AreaLevelBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        BADGE_CLASS[level],
      )}
    >
      <span className={cn("size-1.5 rounded-full", DOT_CLASS[level])} aria-hidden="true" />
      {level}
    </span>
  );
}
