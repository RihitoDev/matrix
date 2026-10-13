import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime } from "./date.utils";

describe("formatDateTime", () => {
  it("formatea una fecha como AAAA-MM-DD HH:mm", () => {
    expect(formatDateTime("2026-03-05T08:07:00")).toBe("2026-03-05 08:07");
  });

  it("devuelve un guion si la fecha no es válida", () => {
    expect(formatDateTime("fecha-invalida")).toBe("-");
  });
});

describe("formatDate", () => {
  it("formatea una fecha como DD/MM/AAAA", () => {
    expect(formatDate("2026-03-05T08:07:00")).toBe("05/03/2026");
  });

  it("devuelve un guion si la fecha no es válida", () => {
    expect(formatDate("fecha-invalida")).toBe("-");
  });
});
