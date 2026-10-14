import { afterEach, describe, expect, it } from "vitest";
import { clearAccessToken, saveAccessToken } from "@/shared/services/storage/access-token-storage";
import { buildSessionToken } from "../testing/vacancy-fixtures";
import { getSessionRoleTag } from "./get-session-role-tag";

describe("getSessionRoleTag", () => {
  afterEach(() => {
    clearAccessToken();
  });

  it("lee el rol del token guardado", () => {
    saveAccessToken(buildSessionToken("empresa"));

    expect(getSessionRoleTag()).toBe("empresa");
  });

  it("devuelve null sin sesión", () => {
    expect(getSessionRoleTag()).toBeNull();
  });

  it("devuelve null si el token no se puede leer", () => {
    saveAccessToken("header.no-es-base64.signature");

    expect(getSessionRoleTag()).toBeNull();
  });

  it("devuelve null si el token no trae un rol válido", () => {
    saveAccessToken(`header.${btoa(JSON.stringify({ sub: "user-id" }))}.signature`);
    expect(getSessionRoleTag()).toBeNull();

    saveAccessToken(`header.${btoa(JSON.stringify({ roleTag: 1 }))}.signature`);
    expect(getSessionRoleTag()).toBeNull();
  });
});
