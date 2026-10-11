import { afterEach, describe, expect, it, vi } from "vitest";
import { clearSession, getRoleTag, getSessionToken } from "./session";

const tokenWith = (payload: unknown) => `h.${btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_")}.s`;

describe("session", () => {
  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("lee y borra el token de sessionStorage", () => {
    sessionStorage.setItem("accessToken", "abc");
    expect(getSessionToken()).toBe("abc");
    clearSession();
    expect(getSessionToken()).toBeNull();
  });

  it("tolera un sessionStorage que lanza", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    expect(getSessionToken()).toBeNull();
    expect(() => clearSession()).not.toThrow();
  });

  it("lee el rol del payload del token", () => {
    expect(getRoleTag(tokenWith({ sub: "u1", roleTag: "administrativo" }))).toBe("administrativo");
  });

  it.each([["sin payload", "solo"], ["payload ilegible", "h.%%%.s"], ["sin roleTag", tokenWith({ sub: "u" })], ["roleTag numérico", tokenWith({ roleTag: 1 })], ["payload no objeto", tokenWith("texto")]])(
    "devuelve null con %s",
    (_name, token) => {
      expect(getRoleTag(token)).toBeNull();
    },
  );
});
