import { describe, expect, it } from "vitest";
import { formatEducationPeriod } from "./format-education-period";

describe("formatEducationPeriod", () => {
  it("formats months and years in Spanish without shifting the calendar date", () => {
    expect(formatEducationPeriod("2021-01-01", "2026-12-01")).toBe("Ene 2021 – Dic 2026");
  });

  it("formats a period within the same year", () => {
    expect(formatEducationPeriod("2025-03-01", "2025-09-30")).toBe("Mar 2025 – Sep 2025");
  });

  it("labels a missing end date without assuming the studies are ongoing", () => {
    expect(formatEducationPeriod("2021-02-01", null)).toBe("Feb 2021 – Fecha de fin no registrada");
  });
});
