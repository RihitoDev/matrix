import { cn } from "@/lib/utils";
import type { AffinityAxis, AxisScores } from "../types/matching-types";
import { AXIS_MAX_SCORE } from "../data/matching.data";

interface GapBreakdownListProps {
  axes: AffinityAxis[];
  gaps: AxisScores;
}

function formatDelta(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}`;
}

export function GapBreakdownList({ axes, gaps }: GapBreakdownListProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">Brecha por área</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Candidato frente al perfil objetivo de la vacante (escala 0-{AXIS_MAX_SCORE}).
      </p>

      <ul className="mt-3 flex flex-col gap-2">
        {axes.map((axis) => {
          const delta = gaps[axis.id];
          const isGap = delta < 0;
          return (
            <li key={axis.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-foreground">{axis.label}</span>
              <div className="flex flex-1 items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", isGap ? "bg-amber-500" : "bg-emerald-500")}
                    style={{ width: `${Math.min(100, (Math.abs(delta) / AXIS_MAX_SCORE) * 100 * 2.5)}%` }}
                  />
                </div>
                <span
                  className={cn(
                    "w-12 shrink-0 text-right font-medium tabular-nums",
                    isGap ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  {formatDelta(delta)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
