import type { ReactNode } from "react";
import type { AreaId } from "./area-detail.types";
import type { RadarAreaScore, RadarKpis, RadarProfile } from "./radar-profile.types";

export interface RadarCardProps {
  as?: "section" | "aside" | "li";
  className?: string;
  children: ReactNode;
  "aria-labelledby"?: string;
}

export interface ProfileHeaderProps {
  profile: RadarProfile;
}

export interface KpiCardsProps {
  kpis: RadarKpis;
}

export interface AffinityRadarChartProps {
  areas: RadarAreaScore[];
  average?: number;
  onAreaClick?: (areaId: AreaId) => void;
  className?: string;
}

export interface AffinityRadarAxisTickProps {
  area: RadarAreaScore;
  x: number | string;
  y: number | string;
  textAnchor?: "start" | "middle" | "end" | "inherit";
  verticalAnchor?: "start" | "middle" | "end";
  onAreaClick?: (areaId: AreaId) => void;
}

export interface AffinityRadarDotProps {
  area: RadarAreaScore;
  cx?: number;
  cy?: number;
  onAreaClick?: (areaId: AreaId) => void;
}

export interface AreaBreakdownPanelProps {
  areas: RadarAreaScore[];
  average: number;
  className?: string;
}
