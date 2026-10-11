import { describe, expect, it } from "vitest";
import { CAREERS } from "./careers.constants";

describe("CAREERS", () => {
  it("lista las dos carreras del catálogo en su orden", () => {
    expect(CAREERS).toEqual([
      "Licenciatura en Ingeniería de Sistemas",
      "Licenciatura Ingeniería en Informática",
    ]);
  });

  it("usa los nombres oficiales de WebSIS en forma NFC", () => {
    expect(CAREERS[0]).toBe("Licenciatura en Ingeniería de Sistemas");
    expect(CAREERS[1]).toBe("Licenciatura Ingeniería en Informática");
    for (const career of CAREERS) {
      expect(career.normalize("NFC")).toBe(career);
    }
  });

  it("no tiene títulos repetidos", () => {
    expect(new Set(CAREERS).size).toBe(CAREERS.length);
  });
});
