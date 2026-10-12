import { afterEach, describe, expect, it } from "vitest";
import { getAccessToken } from "@/shared/services/storage/access-token-storage";
import { endSession, startSession } from "./session";
import { hasSessionMarker } from "./session-cookie";

describe("sesión del navegador", () => {
  afterEach(() => endSession());

  it("startSession guarda el token en sessionStorage y pone la cookie marcadora sin el token", () => {
    startSession("token-de-prueba");

    expect(getAccessToken()).toBe("token-de-prueba");
    expect(hasSessionMarker()).toBe(true);
    expect(document.cookie).not.toContain("token-de-prueba");
  });

  it("endSession borra el token y la cookie", () => {
    startSession("token-de-prueba");
    endSession();

    expect(getAccessToken()).toBeNull();
    expect(hasSessionMarker()).toBe(false);
  });
});
