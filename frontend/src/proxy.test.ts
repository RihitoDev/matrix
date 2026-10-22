import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { SESSION_COOKIE_NAME } from "@/modules/auth/constants/session.constants";
import { config, proxy } from "./proxy";

const BASE_ORIGIN = "http://localhost:3000";

function callProxy(path: string, cookieValue?: string) {
  const headers = cookieValue ? { cookie: `${SESSION_COOKIE_NAME}=${cookieValue}` } : undefined;
  return proxy(new NextRequest(`${BASE_ORIGIN}${path}`, { headers }));
}

describe("Root proxy", () => {
  it("serves the public landing page to anonymous visitors", () => {
    const response = callProxy("/");
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it.each(["1", "0"])("keeps the landing public when the session marker is %s", (marker) => {
    const response = callProxy("/", marker);
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("matches only the root, leaving authentication to route layouts", () => {
    expect(config.matcher).toEqual(["/"]);
  });

  it.each(["/login", "/request-access", "/future-public-page", "/profile", "/chat", "/backoffice/solicitudes"])("does not apply a global session check to %s", (pathname) => {
    const response = callProxy(pathname);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
