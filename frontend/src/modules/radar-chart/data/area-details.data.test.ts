import { describe, expect, it } from "vitest";
import { calculateGap } from "../utils/calculate-gap";
import { getAreaLevel } from "../utils/get-area-level";
import {
  AREA_DETAILS,
  AREA_ORDER,
  CANDIDATE,
  GLOBAL_AVERAGE,
} from "./area-details.data";

const areas = AREA_ORDER.map((id) => AREA_DETAILS[id]);

describe("AREA_ORDER", () => {
  it("lists the six areas in the radar order", () => {
    expect(AREA_ORDER).toEqual([
      "desarrollo",
      "cloud-devops",
      "data-ai",
      "qa",
      "ciberseguridad",
      "gobernanza-ti",
    ]);
  });
});

describe("AREA_DETAILS", () => {
  it("has exactly six areas matching AREA_ORDER", () => {
    expect(Object.keys(AREA_DETAILS)).toHaveLength(6);
    expect(Object.keys(AREA_DETAILS)).toEqual(AREA_ORDER);
  });

  it("uses the record key as the area id", () => {
    AREA_ORDER.forEach((id) => {
      expect(AREA_DETAILS[id].id).toBe(id);
    });
  });

  it("has the expected name and score for each area", () => {
    expect(areas.map(({ name, score }) => [name, score])).toEqual([
      ["Desarrollo", 8.5],
      ["Cloud/DevOps", 7],
      ["Data/AI", 6.5],
      ["QA", 5],
      ["Ciberseguridad", 4.5],
      ["Gobernanza TI", 6],
    ]);
  });

  it("uses the mean of the area scores as the global average", () => {
    const total = areas.reduce((sum, area) => sum + area.score, 0);

    expect(GLOBAL_AVERAGE).toBe(6.25);
    expect(total / areas.length).toBe(GLOBAL_AVERAGE);
  });

  it.each(areas)(
    "derives the level and gap of $name from its score",
    (area) => {
      expect(area.globalAverage).toBe(GLOBAL_AVERAGE);
      expect(area.level).toBe(getAreaLevel(area.score));
      expect(area.gap).toBe(calculateGap(area.score, GLOBAL_AVERAGE));
    },
  );

  it.each(areas)(
    "keeps courses and certifications of $name as separate non-empty lists",
    (area) => {
      expect(Array.isArray(area.courses)).toBe(true);
      expect(Array.isArray(area.certifications)).toBe(true);
      expect(area.courses).not.toBe(area.certifications);
      expect(area.courses.length).toBeGreaterThanOrEqual(2);
      expect(area.courses.length).toBeLessThanOrEqual(4);
      expect(area.certifications.length).toBeGreaterThanOrEqual(1);
      expect(area.certifications.length).toBeLessThanOrEqual(3);

      area.courses.forEach((course) => {
        expect(course).toHaveProperty("institution");
        expect(course).not.toHaveProperty("issuer");
      });
      area.certifications.forEach((certification) => {
        expect(certification).toHaveProperty("issuer");
        expect(certification).not.toHaveProperty("institution");
      });
    },
  );

  it.each(areas)("has at least one experience in $name", (area) => {
    expect(area.experience.length).toBeGreaterThanOrEqual(1);
    expect(area.experience.length).toBeLessThanOrEqual(3);
  });

  it.each(areas)("has between three and six tags in $name", (area) => {
    expect(area.tags.length).toBeGreaterThanOrEqual(3);
    expect(area.tags.length).toBeLessThanOrEqual(6);
  });

  it("does not repeat ids across courses, certifications and experience", () => {
    const ids = areas.flatMap((area) => [
      ...area.courses.map((course) => course.id),
      ...area.certifications.map((certification) => certification.id),
      ...area.experience.map((item) => item.id),
    ]);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("does not repeat course names across areas", () => {
    const names = areas.flatMap((area) =>
      area.courses.map((course) => course.name),
    );

    expect(new Set(names).size).toBe(names.length);
  });

  it("does not repeat certification names across areas", () => {
    const names = areas.flatMap((area) =>
      area.certifications.map((certification) => certification.name),
    );

    expect(new Set(names).size).toBe(names.length);
  });
});

describe("CANDIDATE", () => {
  it("describes the sample candidate", () => {
    expect(CANDIDATE).toEqual({
      name: "Carlos Mendoza Ríos",
      title: "Senior Software Engineer",
    });
  });
});
