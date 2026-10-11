import { describe, expect, it } from "vitest";
import { formatLongDate, formatShortDate } from "./format-long-date";

describe("format-long-date", () => {
  it("formatea en hora de Bolivia (UTC-4)", () => {
    expect(formatLongDate("2026-09-22T13:14:00.000Z")).toBe("22 de septiembre de 2026, 09:14");
    expect(formatShortDate("2026-09-22T13:14:00.000Z")).toBe("22 sep, 09:14");
  });

  it("cruza el día hacia atrás cuando la hora UTC es menor a 4", () => {
    expect(formatLongDate("2026-10-06T02:30:00.000Z")).toBe("5 de octubre de 2026, 22:30");
  });

  it.each([null, undefined, "", "no-es-fecha"])("devuelve null con %j", (value) => {
    expect(formatLongDate(value as string | null)).toBeNull();
    expect(formatShortDate(value as string | null)).toBeNull();
  });
});
