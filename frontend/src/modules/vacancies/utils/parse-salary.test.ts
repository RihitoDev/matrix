import { describe, expect, it } from "vitest";
import { parseSalary } from "./parse-salary";

describe("parseSalary", () => {
  it("devuelve vacío si no hay dígitos", () => {
    expect(parseSalary("")).toEqual({ min: null, max: null, isIncomplete: false });
    expect(parseSalary("Bs ")).toEqual({ min: null, max: null, isIncomplete: false });
  });

  it("lee un monto fijo con separador de miles", () => {
    expect(parseSalary("Bs 5.000")).toEqual({ min: 5000, max: null, isIncomplete: false });
  });

  it("lee un rango", () => {
    expect(parseSalary("Bs 6.500 - 8.000")).toEqual({ min: 6500, max: 8000, isIncomplete: false });
  });

  it("marca incompleto un rango sin máximo", () => {
    expect(parseSalary("Bs 6.500 - ")).toMatchObject({ min: 6500, max: null, isIncomplete: true });
  });

  it("marca incompleto un rango sin mínimo o con más de dos montos", () => {
    expect(parseSalary("-500").isIncomplete).toBe(true);
    expect(parseSalary("1-2-3").isIncomplete).toBe(true);
  });
});
