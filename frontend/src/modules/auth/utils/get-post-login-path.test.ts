import { describe, expect, it } from "vitest";
import { getPostLoginPath } from "./get-post-login-path";

describe("getPostLoginPath", () => {
  it("el rol administrativo va al backoffice", () => {
    expect(getPostLoginPath("administrativo")).toBe("/backoffice/solicitudes");
  });

  it("el rol empresa va al módulo de reclutadores", () => {
    expect(getPostLoginPath("empresa")).toBe("/recruiters");
  });

  it.each(["titulado", "estudiante", "mentor", "", "inventado", null, undefined])(
    "el rol %j va al perfil",
    (role) => {
      expect(getPostLoginPath(role as string | null | undefined)).toBe("/profile");
    },
  );
});
