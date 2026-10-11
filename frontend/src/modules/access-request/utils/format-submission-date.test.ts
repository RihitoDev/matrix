import { describe, expect, it } from "vitest";
import { formatSubmissionDate } from "./format-submission-date";

describe("formatSubmissionDate", () => {
  it.each([
    ["2026-10-05T23:59:34.644Z", "5 oct 2026, 19:59"],
    ["2026-09-22T13:14:00Z", "22 sep 2026, 09:14"],
    ["2026-12-15T12:00:00Z", "15 dic 2026, 08:00"],
  ])("%s se muestra como %s en hora de Bolivia", (iso, expected) => {
    expect(formatSubmissionDate(iso)).toBe(expected);
  });

  it("cerca de la medianoche UTC el día cambia por el desfase de 4 horas", () => {
    expect(formatSubmissionDate("2026-10-06T03:30:00Z")).toBe("5 oct 2026, 23:30");
    expect(formatSubmissionDate("2026-10-06T04:00:00Z")).toBe("6 oct 2026, 00:00");
    expect(formatSubmissionDate("2026-01-01T03:59:00Z")).toBe("31 dic 2025, 23:59");
  });

  it("devuelve null con valores vacíos o inválidos", () => {
    expect(formatSubmissionDate(null)).toBeNull();
    expect(formatSubmissionDate(undefined)).toBeNull();
    expect(formatSubmissionDate("")).toBeNull();
    expect(formatSubmissionDate("no es fecha")).toBeNull();
  });
});
