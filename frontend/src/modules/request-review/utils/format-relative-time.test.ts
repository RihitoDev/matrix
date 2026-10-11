import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "./format-relative-time";

const NOW = new Date("2026-10-05T12:00:00.000Z");
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();

describe("formatRelativeTime", () => {
  it.each([
    [10_000, "hace un momento"],
    [5 * 60_000, "hace 5 min"],
    [2 * 3_600_000, "hace 2 h"],
    [3 * 86_400_000, "hace 3 d"],
  ])("formatea %d ms atrás como %s", (elapsed, expected) => {
    expect(formatRelativeTime(ago(elapsed), NOW)).toBe(expected);
  });

  it("pasados 30 días muestra la fecha", () => {
    expect(formatRelativeTime(ago(40 * 86_400_000), NOW)).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("una fecha futura se trata como ahora", () => {
    expect(formatRelativeTime(new Date(NOW.getTime() + 60_000).toISOString(), NOW)).toBe("hace un momento");
  });

  it.each([null, undefined, "", "no-es-fecha"])("devuelve 'Sin fecha' con %j", (value) => {
    expect(formatRelativeTime(value as string | null)).toBe("Sin fecha");
  });
});
