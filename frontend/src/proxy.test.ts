import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { SESSION_COOKIE_NAME } from "@/modules/auth/constants/session.constants";
import { config, proxy } from "./proxy";

const BASE = "http://localhost:3000";

function call(path: string, withSession = false) {
  const headers = withSession ? { cookie: `${SESSION_COOKIE_NAME}=1` } : undefined;
  return proxy(new NextRequest(`${BASE}${path}`, { headers }));
}

const redirectOf = (response: Response) => response.headers.get("location");
const passes = (response: Response) => response.headers.get("x-middleware-next") === "1" && redirectOf(response) === null;

const matcherRegex = new RegExp(`^${config.matcher[0]}$`);
const matches = (path: string) => matcherRegex.test(path);

describe("proxy: sin cookie de sesión", () => {
  it("la raíz va al login con 307", () => {
    const response = call("/");
    expect(response.status).toBe(307);
    expect(redirectOf(response)).toBe(`${BASE}/login`);
  });

  it.each([
    ["/profile", "/login?next=%2Fprofile"],
    ["/events", "/login?next=%2Fevents"],
    ["/backoffice/solicitudes", "/login?next=%2Fbackoffice%2Fsolicitudes"],
    ["/reports/history", "/login?next=%2Freports%2Fhistory"],
    ["/ruta-que-no-existe", "/login?next=%2Fruta-que-no-existe"],
    ["/profile?tab=cv&x=1", "/login?next=%2Fprofile%3Ftab%3Dcv%26x%3D1"],
  ])("la ruta privada %s redirige con 307 a %s", (path, login) => {
    const response = call(path);
    expect(response.status).toBe(307);
    expect(redirectOf(response)).toBe(`${BASE}${login}`);
  });

  it.each(["/login", "/login?next=%2Fprofile", "/request-access", "/request-access/estado", "/sidebar-preview"])("la ruta pública %s pasa", (path) => {
    expect(passes(call(path))).toBe(true);
  });

  it("Mis pases también exige sesión", () => {
    const response = call("/events/my-passes");
    expect(response.status).toBe(307);
    expect(redirectOf(response)).toBe(`${BASE}/login?next=%2Fevents%2Fmy-passes`);
  });

  it("no confunde rutas parecidas con las públicas", () => {
    expect(call("/login-falso").status).toBe(307);
    expect(call("/events/my-passes-otro").status).toBe(307);
  });
});

describe("proxy: con cookie de sesión", () => {
  it("la raíz va al destino por defecto", () => {
    const response = call("/", true);
    expect(response.status).toBe(307);
    expect(redirectOf(response)).toBe(`${BASE}/profile`);
  });

  it.each(["/profile", "/events", "/backoffice/solicitudes", "/reports/history", "/login", "/request-access"])("%s pasa (el cliente decide en /login)", (path) => {
    expect(passes(call(path, true))).toBe(true);
  });

  it("una cookie con otro valor no cuenta como sesión", () => {
    const response = proxy(new NextRequest(`${BASE}/profile`, { headers: { cookie: `${SESSION_COOKIE_NAME}=0` } }));
    expect(response.status).toBe(307);
  });
});

describe("matcher del proxy", () => {
  it("es un único literal estático", () => {
    expect(config.matcher).toHaveLength(1);
    expect(typeof config.matcher[0]).toBe("string");
  });

  it.each(["/", "/profile", "/login", "/request-access", "/backoffice/solicitudes", "/events/my-passes", "/ruta-que-no-existe"])("incluye %s", (path) => {
    expect(matches(path)).toBe(true);
  });

  it.each([
    "/_next/static/chunks/app.js",
    "/_next/image",
    "/favicon.ico",
    "/manifest.json",
    "/sw.js",
    "/icons/icon-192x192.png",
    "/file.svg",
    "/imagen.webp",
  ])("excluye %s", (path) => {
    expect(matches(path)).toBe(false);
  });
});
