import { describe, expect, it } from "vitest";
import { getPostLoginPath } from "./get-post-login-path";

describe("getPostLoginPath", () => {
  it("el rol administrativo va al backoffice", () => {
    expect(getPostLoginPath("administrativo")).toBe("/backoffice/solicitudes");
  });

  it.each(["titulado", "estudiante", "mentor", "empresa", "", "inventado", null, undefined])(
    "el rol %j va a la ruta de siempre",
    (role) => {
      expect(getPostLoginPath(role as string | null | undefined)).toBe("/");
    },
  );
});
