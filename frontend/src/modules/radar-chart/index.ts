export type {
  AreaDetail,
  AreaId,
  AreaLevel,
  Certification,
  Course,
  ExperienceItem,
} from "./types/area-detail.types";
export {
  AREA_DETAILS,
  AREA_ORDER,
  CANDIDATE,
  GLOBAL_AVERAGE,
} from "./data/area-details.data";
export { calculateGap } from "./utils/calculate-gap";
export { formatDecimal } from "./utils/format-decimal";
export { getAreaDetail } from "./utils/get-area-detail";
export { getAreaLevel } from "./utils/get-area-level";
export type { AreaDetailPanelProps } from "./types/area-detail-components.types";
export { AreaDetailPanel } from "./components/area-detail-panel";
export type { RadarAreaScore, RadarKpis, RadarProfile } from "./types/radar-profile.types";
export type {
  AffinityRadarChartProps,
  AreaBreakdownPanelProps,
  KpiCardsProps,
  ProfileHeaderProps,
} from "./types/radar-profile-components.types";
export { RADAR_AREA_SCORES, RADAR_KPIS, RADAR_PROFILE } from "./data/radar-profile.data";
export { calculateAverage } from "./utils/calculate-average";
export { ProfileHeader } from "./components/profile-header";
export { KpiCards } from "./components/kpi-cards";
export { AffinityRadarChart } from "./components/affinity-radar-chart";
export { AreaBreakdownPanel } from "./components/area-breakdown-panel";
export { RadarProfileView } from "./views/radar-profile-view";
export { Epic3Shell } from "./components/epic3-shell";
export { ReviewQueueView } from "./views/review-queue-view";
export {
  AreaDetailPreviewView,
} from "./views/area-detail-preview-view";

export {
  AreaDetailInteractionPreviewView,
} from "./views/area-detail-interaction-preview-view";