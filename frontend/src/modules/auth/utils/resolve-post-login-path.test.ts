import { describe, expect, it } from "vitest";
import { resolvePostLoginPath } from "./resolve-post-login-path";

describe("resolvePostLoginPath", () => {
  it.each(["titulado", "estudiante", "mentor", "empresa"])("el rol %s vuelve a la ruta privada pedida", (role) => {
    expect(resolvePostLoginPath(role, "/events/my-passes")).toBe("/events/my-passes");
    expect(resolvePostLoginPath(role, "/reports/history?x=1")).toBe("/reports/history?x=1");
  });

  it("sin next usa el destino por defecto de cada rol", () => {
    expect(resolvePostLoginPath("titulado", null)).toBe("/profile");
    expect(resolvePostLoginPath("administrativo", null)).toBe("/backoffice/solicitudes");
    expect(resolvePostLoginPath("", undefined)).toBe("/profile");
  });

  it.each(["//evil.com", "https://evil.com", "/\\evil.com", "/login", "/"])("ignora el next peligroso %s", (next) => {
    expect(resolvePostLoginPath("titulado", next)).toBe("/profile");
    expect(resolvePostLoginPath("administrativo", next)).toBe("/backoffice/solicitudes");
  });

  it("el administrativo vuelve solo a rutas del backoffice y no a pantallas de otros roles", () => {
    expect(resolvePostLoginPath("administrativo", "/backoffice/solicitudes/abc")).toBe("/backoffice/solicitudes/abc");
    expect(resolvePostLoginPath("administrativo", "/events/my-passes")).toBe("/backoffice/solicitudes");
  });

  it("un rol sin acceso al backoffice no vuelve a él", () => {
    expect(resolvePostLoginPath("titulado", "/backoffice/solicitudes")).toBe("/profile");
  });
});
