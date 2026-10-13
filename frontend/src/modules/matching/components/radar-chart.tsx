"use client";

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

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
  id: string;
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
}

export function RadarChart({ axes, series, maxValue = 10, height = 320 }: RadarChartProps) {
  const data = axes.map((axis) => {
    const row: Record<string, string | number> = { axis: axis.label };
    series.forEach((s) => {
      row[s.id] = s.values[axis.id] ?? 0;
    });
    return row;
  });

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <RechartsRadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, maxValue]}
            tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }}
            axisLine={false}
            tickCount={6}
          />
          {series.map((s, index) => (
            <Radar
              key={s.id}
              name={s.name}
              dataKey={s.id}
              stroke={s.color}
              fill={s.color}
              fillOpacity={index === 0 ? 0.15 : 0}
              strokeWidth={2}
              strokeDasharray={index === 0 ? undefined : "4 3"}
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
          <Legend wrapperStyle={{ fontSize: 12, color: "var(--color-text-secondary)" }} />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
