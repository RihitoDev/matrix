import { cn } from "@/lib/utils";
import type { AreaLevelBadgeProps } from "../types/area-detail-components.types";
import type { AreaLevel } from "../types/area-detail.types";

const BADGE_CLASS: Record<AreaLevel, string> = {
  Bajo: "border-border-strong bg-surface-soft text-text-secondary",
  Medio:
    "border-transparent bg-gold/10 text-[color-mix(in_srgb,var(--color-gold)_50%,var(--color-ink))]",
  Alto: "border-transparent bg-ink text-surface",
  Experto: "border-transparent bg-accent text-surface",
};

const DOT_CLASS: Record<AreaLevel, string> = {
  Bajo: "bg-border-strong",
  Medio: "bg-gold",
  Alto: "bg-surface",
  Experto: "bg-surface",
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
