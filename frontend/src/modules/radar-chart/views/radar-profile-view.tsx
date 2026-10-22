"use client";

import { RADAR_AREA_SCORES, RADAR_KPIS, RADAR_PROFILE } from "../data/radar-profile.data";
import { calculateAverage } from "../utils/calculate-average";
import { AffinityRadarChart } from "../components/affinity-radar-chart";
import { AreaBreakdownPanel } from "../components/area-breakdown-panel";
import { KpiCards } from "../components/kpi-cards";
import { ProfileHeader } from "../components/profile-header";

export function RadarProfileView() {
  const average = calculateAverage(RADAR_AREA_SCORES.map((area) => area.score));

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 font-sans">

      <ProfileHeader profile={RADAR_PROFILE} />
      <KpiCards kpis={RADAR_KPIS} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <AffinityRadarChart areas={RADAR_AREA_SCORES} average={average} />
        <AreaBreakdownPanel areas={RADAR_AREA_SCORES} average={average} />
      </div>
    </main>
  );
}
