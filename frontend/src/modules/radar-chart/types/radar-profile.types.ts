import type { AreaId } from "./area-detail.types";

export interface RadarProfile {
  name: string;
  title: string;
  yearsOfExperience: number;
  technologies: string[];
  photoUrl: string;
}

export interface RadarKpis {
  globalAffinity: number;
  variationVsPrevious: number;
  keyAreas: number;
  keywords: number;
  highRelevanceKeywords: number;
  targetProfilePercent: number;
  minimumThresholdPercent: number;
}

export interface RadarAreaScore {
  id: AreaId;
  name: string;
  score: number;
}
