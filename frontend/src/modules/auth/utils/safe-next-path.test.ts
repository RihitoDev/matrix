import { describe, expect, it } from "vitest";
import { buildLoginUrl, getSafeNextPath } from "./safe-next-path";

describe("getSafeNextPath", () => {
  it.each([
    ["/events/my-passes", "/events/my-passes"],
    ["/profile", "/profile"],
    ["/profile?tab=cv", "/profile?tab=cv"],
    ["/reports/history#top", "/reports/history#top"],
    ["/backoffice/solicitudes", "/backoffice/solicitudes"],
  ])("acepta %s", (value, expected) => {
    expect(getSafeNextPath(value)).toBe(expected);
  });

  it.each([
    ["nulo", null],
    ["indefinido", undefined],
    ["vacío", ""],
    ["sin barra inicial", "profile"],
    ["esquema https", "https://evil.com"],
    ["esquema javascript", "javascript:alert(1)"],
    ["doble barra", "//evil.com"],
    ["barra y contrabarra", "/\\evil.com"],
    ["contrabarra inicial", "\\evil.com"],
    ["contrabarra en la ruta", "/profile\\..\\evil"],
    ["carácter de control", "/profile\n/evil"],
    ["tabulador", "/\tprofile"],
    ["el login", "/login"],
    ["subruta del login", "/login/otro"],
    ["el login con consulta", "/login?next=/profile"],
    ["la raíz", "/"],
    ["una ruta pública", "/request-access"],
    ["demasiado largo", `/${"a".repeat(400)}`],
  ])("rechaza %s", (_name, value) => {
    expect(getSafeNextPath(value as string | null | undefined)).toBeNull();
  });

  it("rechaza una URL que cambia de origen al interpretarse", () => {
    expect(getSafeNextPath("/@evil.com")).not.toMatch(/^https?:/);
    expect(getSafeNextPath("/%2F%2Fevil.com")).toBe("/%2F%2Fevil.com");
  });
});

describe("buildLoginUrl", () => {
  it("agrega la ruta codificada", () => {
    expect(buildLoginUrl("/profile?tab=cv")).toBe("/login?next=%2Fprofile%3Ftab%3Dcv");
  });

  it.each(["/", "/login", "//evil.com", "https://evil.com", null, undefined, "/request-access"])("sin next para %s", (value) => {
    expect(buildLoginUrl(value as string | null | undefined)).toBe("/login");
  });
});
