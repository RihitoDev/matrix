"use client";

import { ChevronRight } from "lucide-react";
import { RADAR_AREA_SCORES, RADAR_KPIS, RADAR_PROFILE } from "../data/radar-profile.data";
import { calculateAverage } from "../utils/calculate-average";
import { AffinityRadarChart } from "../components/affinity-radar-chart";
import { AreaBreakdownPanel } from "../components/area-breakdown-panel";
import { KpiCards } from "../components/kpi-cards";
import { ProfileHeader } from "../components/profile-header";

export function RadarProfileView() {
  const average = calculateAverage(RADAR_AREA_SCORES.map((area) => area.score));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <nav aria-label="Ruta de navegación">
          <ol className="flex items-center gap-1 text-xs text-text-secondary">
            <li>Mi Perfil</li>
            <li className="flex items-center gap-1 font-medium text-ink-soft" aria-current="page">
              <ChevronRight className="size-3" aria-hidden="true" />
              Radar de afinidad
            </li>
          </ol>
        </nav>
        <p className="text-[10px] font-medium tracking-[0.14em] text-text-secondary uppercase">
          UMSSY · Motor vectorial NLP v1.0 · Gestión 3.0
        </p>
      </div>

      <ProfileHeader profile={RADAR_PROFILE} />
      <KpiCards kpis={RADAR_KPIS} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <AffinityRadarChart areas={RADAR_AREA_SCORES} average={average} />
        <AreaBreakdownPanel areas={RADAR_AREA_SCORES} average={average} />
      </div>
    </main>
  );
}
