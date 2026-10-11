import { describe, expect, it } from "vitest";
import { getAcademicPeriods } from "./academic-periods";

describe("getAcademicPeriods", () => {
  it("empieza en la gestión actual del segundo semestre", () => {
    expect(getAcademicPeriods(new Date("2026-10-08T12:00:00-04:00"), 2025)).toEqual([
      "II-2026", "I-2026", "II-2025", "I-2025",
    ]);
  });

  it("no incluye el segundo semestre si todavía no empezó", () => {
    expect(getAcademicPeriods(new Date("2026-06-30T12:00:00-04:00"), 2025)).toEqual(["I-2026", "II-2025", "I-2025"]);
  });

  it("usa la hora de Bolivia en el cambio de semestre", () => {
    expect(getAcademicPeriods(new Date("2026-07-01T03:00:00Z"), 2026)).toEqual(["I-2026"]);
    expect(getAcademicPeriods(new Date("2026-07-01T04:00:00Z"), 2026)).toEqual(["II-2026", "I-2026"]);
  });

  it("usa la hora de Bolivia en el cambio de año", () => {
    expect(getAcademicPeriods(new Date("2026-01-01T02:00:00Z"), 2025)).toEqual(["II-2025", "I-2025"]);
  });

  it("incluye todas las gestiones desde 2020", () => {
    const periods = getAcademicPeriods(new Date("2026-10-08T12:00:00-04:00"));
    expect(periods.at(-1)).toBe("I-2020");
    expect(periods).toHaveLength(14);
  });
});
