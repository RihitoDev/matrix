import { describe, expect, it } from "vitest";
import { resolvePostLoginPath } from "./resolve-post-login-path";

describe("resolvePostLoginPath", () => {
  it.each(["titulado", "mentor"])("el rol %s vuelve a la ruta privada pedida", (role) => {
    expect(resolvePostLoginPath(role, "/events/my-passes")).toBe("/events/my-passes");
    expect(resolvePostLoginPath(role, "/vacancies/abc?tab=details")).toBe("/vacancies/abc?tab=details");
  });

  it("does not return users to another role's view or to unknown routes", () => {
    expect(resolvePostLoginPath(["estudiante"], "/chat")).toBe("/profile");
    expect(resolvePostLoginPath(["empresa"], "/vacancies/abc")).toBe("/recruiters");
    expect(resolvePostLoginPath(["empresa"], "/chat")).toBe("/recruiters");
    expect(resolvePostLoginPath(["empresa"], "/profile")).toBe("/profile");
    expect(resolvePostLoginPath(["titulado"], "/matching")).toBe("/profile");
    expect(resolvePostLoginPath(["titulado"], "/reports/history")).toBe("/profile");
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
  it('lets administrative accounts resume common functions without selecting a role', () => {
    expect(resolvePostLoginPath(['administrativo'], '/chat')).toBe('/backoffice/solicitudes');
    expect(resolvePostLoginPath(['administrativo'], '/affinity-radar/review-queue')).toBe('/affinity-radar/review-queue');
    expect(resolvePostLoginPath(['administrativo', 'mentor'], '/mentor/availability')).toBe('/mentor/availability');
  });

  it('chooses the company portal for a company session and denies backoffice return without that role', () => {
    expect(resolvePostLoginPath(['empresa'], null)).toBe('/recruiters');
    expect(resolvePostLoginPath(['empresa'], '/backoffice/solicitudes')).toBe('/recruiters');
  });

});
