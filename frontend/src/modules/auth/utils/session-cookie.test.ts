import { afterEach, describe, expect, it } from "vitest";
import { SESSION_COOKIE_NAME } from "../constants/session.constants";
import { clearSessionMarker, hasSessionMarker, setSessionMarker } from "./session-cookie";

describe("cookie marcadora de sesión", () => {
  afterEach(() => clearSessionMarker());

  it("se pone con valor fijo y se lee", () => {
    expect(hasSessionMarker()).toBe(false);
    setSessionMarker();
    expect(hasSessionMarker()).toBe(true);
    expect(document.cookie).toBe(`${SESSION_COOKIE_NAME}=1`);
  });

  it("se borra", () => {
    setSessionMarker();
    clearSessionMarker();
    expect(hasSessionMarker()).toBe(false);
    expect(document.cookie).not.toContain(SESSION_COOKIE_NAME);
  });

  it("no lleva el token ni datos: solo el valor 1", () => {
    sessionStorage.setItem("accessToken", "token-secreto");
    setSessionMarker();
    expect(document.cookie).not.toContain("token-secreto");
    sessionStorage.clear();
  });

  it("define SameSite=Lax y Path=/ sin Expires, y Secure solo en https", () => {
    const writes: string[] = [];
    const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
    Object.defineProperty(document, "cookie", { configurable: true, get: () => "", set: (value: string) => void writes.push(value) });
    try {
      setSessionMarker();
      expect(writes[0]).toBe(`${SESSION_COOKIE_NAME}=1; Path=/; SameSite=Lax`);
      expect(writes[0]).not.toMatch(/expires|max-age/i);
    } finally {
      delete (document as unknown as { cookie?: string }).cookie;
      if (descriptor) Object.defineProperty(Document.prototype, "cookie", descriptor);
    }
  });
});
