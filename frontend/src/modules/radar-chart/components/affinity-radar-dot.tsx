"use client";

import type { AffinityRadarDotProps } from "../types/radar-profile-components.types";
import { formatDecimal } from "../utils/format-decimal";

export function AffinityRadarDot({ area, cx, cy, onAreaClick }: AffinityRadarDotProps) {
  return (
    <g
      data-testid={`radar-dot-${area.id}`}
      onClick={onAreaClick ? () => onAreaClick(area.id) : undefined}
      className={onAreaClick ? "group cursor-pointer" : undefined}
    >
      <title>{`${area.name}: ${formatDecimal(area.score, 1)}`}</title>
      <circle cx={cx} cy={cy} r={12} fill="transparent" />
      <circle
        cx={cx}
        cy={cy}
        r={4.5}
        strokeWidth={2}
        className="fill-accent stroke-surface motion-safe:transition-[r] group-hover:[r:6px]"
      />
    </g>
  );
}
