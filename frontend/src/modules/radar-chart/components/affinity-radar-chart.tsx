"use client";

import { useId } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import type { AffinityRadarChartProps } from "../types/radar-profile-components.types";
import { formatDecimal } from "../utils/format-decimal";
import { AffinityRadarAxisTick } from "./affinity-radar-axis-tick";
import { AffinityRadarDot } from "./affinity-radar-dot";
import { RadarCard } from "./radar-card";

const MAX_SCORE = 10;
const LEVEL_TICK_COUNT = 6;
const SERIES_LABEL = "Puntaje de afinidad del perfil";

export function AffinityRadarChart({
  areas,
  average,
  onAreaClick,
  className,
}: AffinityRadarChartProps) {
  const titleId = useId();
  const hasAreas = areas.length > 0;

  return (
    <RadarCard aria-labelledby={titleId} className={cn("flex flex-col p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id={titleId} className="font-heading text-lg font-semibold tracking-tight text-ink">
            Desglose vectorial de afinidad
          </h2>
          <p className="mt-1 text-xs text-text-secondary">
            {areas.length} áreas · Tokenización NLP
          </p>
        </div>
        {hasAreas && average !== undefined && (
          <div className="shrink-0 text-right">
            <p className="font-heading text-3xl leading-none font-semibold text-accent tabular-nums">
              {formatDecimal(average, 2)}
            </p>
            <p className="mt-1 text-[11px] font-semibold tracking-[0.12em] text-text-secondary uppercase">
              Promedio
            </p>
          </div>
        )}
      </div>

      {hasAreas ? (
        <>
          <div className="mt-2 h-[440px] w-full [&_.recharts-surface]:outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={areas} outerRadius="68%" accessibilityLayer={false}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={{ stroke: "var(--color-border-strong)" }}
                  tick={({ x, y, textAnchor, verticalAnchor, index }) => (
                    <AffinityRadarAxisTick
                      area={areas[index]}
                      x={x}
                      y={y}
                      textAnchor={textAnchor}
                      verticalAnchor={verticalAnchor}
                      onAreaClick={onAreaClick}
                    />
                  )}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, MAX_SCORE]}
                  tickCount={LEVEL_TICK_COUNT}
                  axisLine={false}
                  tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }}
                />
                <Radar
                  name={SERIES_LABEL}
                  dataKey="score"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  fill="var(--color-accent)"
                  fillOpacity={0.14}
                  dot={({ cx, cy, index }) => (
                    <AffinityRadarDot
                      key={areas[index].id}
                      area={areas[index]}
                      cx={cx}
                      cy={cy}
                      onAreaClick={onAreaClick}
                    />
                  )}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="flex items-center gap-2 text-xs text-text-secondary">
            <span
              className="h-2.5 w-5 rounded-sm border border-accent bg-accent/15"
              aria-hidden="true"
            />
            {SERIES_LABEL}
          </p>
        </>
      ) : (
        <div className="mt-6 flex min-h-60 flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border-strong bg-surface-soft p-6 text-center">
          <p className="text-sm font-semibold text-ink">Aún no hay datos de afinidad</p>
          <p className="text-xs text-text-secondary">
            El radar se mostrará cuando el perfil tenga áreas con puntaje.
          </p>
        </div>
      )}
    </RadarCard>
  );
}
