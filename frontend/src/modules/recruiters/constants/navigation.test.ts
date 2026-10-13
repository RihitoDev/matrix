import { describe, expect, it } from "vitest";
import { RECRUITERS_NAVIGATION, RECRUITERS_ROUTES } from "./navigation";

describe("RECRUITERS_NAVIGATION", () => {
  it("lleva al inicio de empresa y al registro de vacantes", () => {
    expect(RECRUITERS_NAVIGATION.map((item) => item.href)).toEqual([
      RECRUITERS_ROUTES.home,
      undefined,
      RECRUITERS_ROUTES.newJobOffer,
      undefined,
    ]);
  });

  it("deja sin enlace las secciones que todavía son maqueta", () => {
    const withoutLink = RECRUITERS_NAVIGATION.filter((item) => !item.href).map((item) => item.label);

    expect(withoutLink).toEqual(["Mis vacantes", "Perfil de empresa"]);
  });
});
