import { describe, expect, it } from "vitest";
import { calculateAverage } from "../utils/calculate-average";
import { AREA_DETAILS, AREA_ORDER, CANDIDATE, GLOBAL_AVERAGE } from "./area-details.data";
import { RADAR_AREA_SCORES, RADAR_KPIS, RADAR_PROFILE } from "./radar-profile.data";

describe("radar profile data", () => {
  it("reuses the candidate of the area detail data", () => {
    expect(RADAR_PROFILE.name).toBe(CANDIDATE.name);
    expect(RADAR_PROFILE.title).toBe(CANDIDATE.title);
  });

  it("derives the six area scores from AREA_DETAILS in AREA_ORDER", () => {
    expect(RADAR_AREA_SCORES.map((area) => area.id)).toEqual(AREA_ORDER);

    RADAR_AREA_SCORES.forEach((area) => {
      expect(area.name).toBe(AREA_DETAILS[area.id].name);
      expect(area.score).toBe(AREA_DETAILS[area.id].score);
    });
  });

  it("keeps the global affinity equal to the average of the areas", () => {
    const average = calculateAverage(RADAR_AREA_SCORES.map((area) => area.score));

    expect(average).toBe(GLOBAL_AVERAGE);
    expect(RADAR_KPIS.globalAffinity).toBe(GLOBAL_AVERAGE);
    expect(RADAR_KPIS.keyAreas).toBe(RADAR_AREA_SCORES.length);
  });
});
