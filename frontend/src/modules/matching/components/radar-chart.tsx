"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { AffinityRadarAxisTick } from "@/modules/radar-chart/components/affinity-radar-axis-tick";
import { AffinityRadarDot } from "@/modules/radar-chart/components/affinity-radar-dot";
import type { AffinityAxisId } from "../types/matching-types";

/**
 * Gráfico de radar comparativo del módulo Matching (HU3).
 *
 * Qué dibuja
 * - Una o más series sobre los mismos ejes. En Matching son el perfil del candidato
 *   (primera serie, relleno rojo UMSS) y el perfil objetivo de la vacante (segunda
 *   serie, contorno punteado en tinta). La primera serie siempre lleva relleno y
 *   trazo continuo; las siguientes, trazo punteado y sin relleno, para que se
 *   distingan aunque se superpongan.
 *
 * Por qué no reutiliza AffinityRadarChart (modules/radar-chart)
 * - AffinityRadarChart dibuja una sola serie dentro de su propia tarjeta, con
 *   promedio y ejes clicables. Aquí se necesita comparar dos series sin tarjeta ni
 *   interacción por eje. Este componente no importa tipos de matching-types.ts, así
 *   que puede moverse a shared/components si otra épica necesita comparar series.
 *
 * Contrato de datos (se define en types/, data/ y services/ del módulo)
 * - Ejes: desarrollo, cloud-devops, data-ai, qa, ciberseguridad y gobernanza-ti,
 *   en ese orden. Son los mismos ids que AreaId en modules/radar-chart (HU1, HU2
 *   y HU4); los puntajes de Carlos Mendoza Ríos coinciden con los de su perfil.
 * - Escala: puntaje de 0 a 10 por eje (prop maxValue).
 * - Brecha por eje = puntaje del candidato - puntaje objetivo. Negativa es brecha,
 *   positiva es fortaleza.
 * - % de afinidad = 100 - (suma de |brechas| / (cantidad de ejes x 10)) x 100,
 *   redondeado y limitado entre 0 y 100. Es una fórmula simple y determinista,
 *   pensada para datos de ejemplo.
 * - Los datos son fijos en el frontend: buscar, filtrar, ordenar y cambiar de
 *   vacante no generan peticiones de red.
 *
 */

export interface RadarChartAxis {
  id: AffinityAxisId;
  label: string;
}

export interface RadarChartSeries {
  id: string;
  name: string;
  color: string;
  values: Record<string, number>;
}

interface RadarChartProps {
  axes: RadarChartAxis[];
  series: RadarChartSeries[];
  maxValue?: number;
  height?: number;
  onAxisSelect?: (axisId: AffinityAxisId) => void;
}

export function RadarChart({
  axes,
  series,
  maxValue = 10,
  height = 320,
  onAxisSelect,
}: RadarChartProps) {
  const candidateSeries = series.find((item) => item.id === "candidate");
  const targetSeries = series.find((item) => item.id === "target");
  const legendSeries = targetSeries
    ? [targetSeries, ...series.filter((item) => item.id !== "target")]
    : series;

  const data = axes.map((axis) => {
    const row: Record<string, string | number> = { axis: axis.label };
    series.forEach((item) => {
      row[item.id] = item.values[axis.id] ?? 0;
    });
    return row;
  });

  return (
    <div className="min-w-0">
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <RechartsRadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="var(--color-border)" />
            <PolarAngleAxis
              dataKey="axis"
              tick={({ x, y, textAnchor, verticalAnchor, index }) => {
                const axis = axes[index];
                if (!axis) return <g />;
                return (
                  <AffinityRadarAxisTick
                    area={{
                      id: axis.id,
                      name: axis.label,
                      score: candidateSeries?.values[axis.id] ?? 0,
                    }}
                    x={x}
                    y={y}
                    textAnchor={textAnchor}
                    verticalAnchor={verticalAnchor}
                    onAreaClick={onAxisSelect}
                  />
                );
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, maxValue]}
              tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }}
              axisLine={false}
              tickCount={6}
            />
            {series.map((item) => (
              <Radar
                key={item.id}
                name={item.name}
                dataKey={item.id}
                stroke={item.color}
                fill={item.color}
                fillOpacity={item.id === "candidate" ? 0.15 : 0}
                strokeWidth={2}
                strokeDasharray={item.id === "target" ? "4 3" : undefined}
                dot={
                  item.id === "candidate"
                    ? ({ cx, cy, index }) => {
                        const axis = axes[index];
                        if (!axis) return <g />;
                        return (
                          <AffinityRadarDot
                            key={axis.id}
                            area={{ id: axis.id, name: axis.label, score: item.values[axis.id] ?? 0 }}
                            cx={cx}
                            cy={cy}
                            onAreaClick={onAxisSelect}
                          />
                        );
                      }
                    : false
                }
              />
            ))}
            <Tooltip
              contentStyle={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
                color: "var(--color-ink)",
                fontSize: 12,
              }}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
      <div
        role="list"
        aria-label="Leyenda del radar comparativo"
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground"
      >
        {legendSeries.map((item) => (
          <div key={item.id} role="listitem" className="inline-flex items-center gap-1.5">
            <span className="size-3 shrink-0" style={{ backgroundColor: item.color }} aria-hidden="true" />
            <span>{item.name}</span>
          </div>
        ))}
      </div>
      {onAxisSelect && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Selecciona un eje o un punto del radar para ver sus evidencias.
        </p>
      )}
    </div>
  );
}
