"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import { Button } from "@/components/ui/button";
import { getInitials } from "@/shared/utils/get-initials";

import type {
  ReviewAction,
  ReviewAffinityArea,
  ReviewAffinityLevel,
  ReviewProfile,
} from "../types/review-queue.types";
import { ReviewStatusBadge } from "./review-status-badge";

interface ReviewProfileDetailProps {
  profile: ReviewProfile | null;
  localAction: ReviewAction | null;
  onAction: (action: ReviewAction) => void;
}

function getLevelClass(level: ReviewAffinityLevel): string {
  switch (level) {
    case "Experto":
      return "bg-accent";

    case "Avanzado":
      return "bg-gold";

    case "Intermedio":
      return "bg-ink-soft";

    case "Base":
      return "bg-border-strong";
  }
}

function ReviewAffinityRadarChart({
  areas,
  average,
}: {
  areas: ReviewAffinityArea[];
  average: number;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-ink">
            Radar de Afinidad
          </h3>

          <p className="mt-1 text-xs text-text-secondary">
            {areas.length} áreas evaluadas
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-accent">
            {average.toFixed(2)}
          </p>

          <p className="text-[9px] uppercase tracking-widest text-text-secondary">
            Promedio
          </p>
        </div>
      </div>

      <div className="h-[330px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={areas} outerRadius="65%">
            <PolarGrid stroke="var(--color-border)" />

            <PolarAngleAxis
              dataKey="area"
              tick={{
                fill: "var(--color-text-secondary)",
                fontSize: 11,
              }}
            />

            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tickCount={6}
              axisLine={false}
              tick={{
                fill: "var(--color-text-secondary)",
                fontSize: 9,
              }}
            />

            <Radar
              name="Profile Affinity Score"
              dataKey="puntuacion"
              stroke="var(--color-accent)"
              strokeWidth={2}
              fill="var(--color-accent)"
              fillOpacity={0.15}
              dot={{
                r: 4,
                fill: "var(--color-accent)",
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <span className="h-2.5 w-5 rounded-sm bg-interaction" />
        Profile Affinity Score
      </div>
    </section>
  );
}

function ReviewAreaBreakdownPanel({
  areas,
  average,
}: {
  areas: ReviewAffinityArea[];
  average: number;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h3 className="text-sm font-semibold text-ink">
        Desglose por Área
      </h3>

      <p className="mt-1 text-xs text-text-secondary">
        Puntuación obtenida en cada dimensión
      </p>

      <ul className="mt-5 space-y-4">
        {areas.map((area) => (
          <li key={area.area}>
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`h-1.5 w-1.5 rounded-full ${getLevelClass(
                  area.nivel,
                )}`}
              />

              <span className="text-ink">{area.area}</span>

              <span className="ml-auto text-[10px] text-text-secondary">
                {area.nivel}
              </span>

              <span className="w-8 text-right font-semibold text-ink">
                {area.puntuacion.toFixed(1)}
              </span>
            </div>

            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-soft">
              <div
                className={`h-full rounded-full ${getLevelClass(
                  area.nivel,
                )}`}
                style={{
                  width: `${area.puntuacion * 10}%`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-baseline justify-between border-t border-border pt-4">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
          Media global
        </span>

        <span className="text-xl font-bold text-accent">
          {average.toFixed(2)}

          <span className="ml-1 text-[10px] font-normal text-text-secondary">
            / 10
          </span>
        </span>
      </div>
    </section>
  );
}

export function ReviewProfileDetail({
  profile,
  localAction,
  onAction,
}: ReviewProfileDetailProps) {
  if (!profile) {
    return (
      <section className="bg-surface p-6 lg:p-8">
        <div className="flex h-full min-h-[500px] items-center justify-center">
          <div className="max-w-sm text-center">
            <h2 className="text-lg font-semibold text-ink">
              Detalle del perfil
            </h2>

            <p className="mt-2 text-sm text-text-secondary">
              Selecciona un perfil de la lista para visualizar su información.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const showActions = profile.estado !== "Completado";

  return (
    <section className="bg-surface p-6 lg:p-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-start gap-4 border-b border-border pb-5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-soft text-sm font-semibold text-ink">
            {getInitials(profile.nombre)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink">
                  {profile.nombre}
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                  {profile.cargoObjetivo}
                </p>
              </div>

              <ReviewStatusBadge status={profile.estado} />
            </div>

            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-text-secondary">
              <span>
                Enviado: {profile.fechaEnvio}
              </span>

              <span className="font-semibold text-ink">
                Afinidad global: {profile.afinidadGlobal.toFixed(1)}/10
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_280px]">
          <ReviewAffinityRadarChart
            areas={profile.areas}
            average={profile.afinidadGlobal}
          />

          <ReviewAreaBreakdownPanel
            areas={profile.areas}
            average={profile.afinidadGlobal}
          />
        </div>

        {showActions && (
          <div className="mt-6 border-t border-border pt-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                className="flex-1"
                onClick={() => onAction("approved")}
              >
                Aprobar y publicar radar
              </Button>

              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={() => onAction("rejected")}
              >
                Rechazar envío
              </Button>
            </div>

            {localAction && (
              <div
                role="status"
                className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                  localAction === "approved"
                    ? "border-border bg-surface-soft text-ink"
                    : "border-destructive/20 bg-destructive/10 text-destructive"
                }`}
              >
                {localAction === "approved"
                  ? "Radar aprobado localmente. No se enviaron datos al backend."
                  : "Envío rechazado localmente. No se modificaron datos persistentes."}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}