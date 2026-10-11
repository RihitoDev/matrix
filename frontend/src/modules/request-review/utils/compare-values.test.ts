import { describe, expect, it } from "vitest";
import { normalizeValue, valuesMatch } from "./compare-values";

describe("compare-values", () => {
  it("normaliza mayúsculas, acentos y espacios", () => {
    expect(normalizeValue("  JOSÉ   Pérez ")).toBe("jose perez");
  });

  it("coincide sin distinguir mayúsculas, acentos ni espacios repetidos", () => {
    expect(valuesMatch("José Pérez", "jose  PEREZ")).toBe(true);
    expect(valuesMatch("1234567", " 1234567 ")).toBe(true);
  });

  it("no coincide con un valor distinto o vacío", () => {
    expect(valuesMatch("José", "Jose Luis")).toBe(false);
    expect(valuesMatch("José", "")).toBe(false);
    expect(valuesMatch("José", "   ")).toBe(false);
  });
});
