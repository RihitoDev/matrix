import type { RadarAreaScore, RadarKpis, RadarProfile } from "../types/radar-profile.types";
import { AREA_DETAILS, AREA_ORDER, CANDIDATE } from "./area-details.data";

export const RADAR_PROFILE: RadarProfile = {
  name: CANDIDATE.name,
  title: CANDIDATE.title,
  yearsOfExperience: 8,
  technologies: [
    "React",
    "Node.js",
    "AWS",
    "Docker",
    "Python",
    "PostgreSQL",
    "TypeScript",
    "Kubernetes",
  ],
  photoUrl: "/carlos.jpg",
};

export const RADAR_KPIS: RadarKpis = {
  globalAffinity: 6.25,
  variationVsPrevious: 0.8,
  keyAreas: 6,
  keywords: 142,
  highRelevanceKeywords: 37,
  targetProfilePercent: 73,
  minimumThresholdPercent: 60,
};

export const RADAR_AREA_SCORES: RadarAreaScore[] = AREA_ORDER.map((id) => ({
  id,
  name: AREA_DETAILS[id].name,
  score: AREA_DETAILS[id].score,
}));
