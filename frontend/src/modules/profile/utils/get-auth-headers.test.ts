import { afterEach, describe, expect, it } from "vitest";
import { ACCESS_TOKEN_STORAGE_KEY } from "../config/auth-storage.config";
import { getAuthHeaders } from "./get-auth-headers";

describe("getAuthHeaders", () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("sends the saved access token as a bearer token", () => {
    window.sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, "token-123");

    expect(getAuthHeaders()).toEqual({ Authorization: "Bearer token-123" });
  });

  it("sends no headers when there is no saved token", () => {
    expect(getAuthHeaders()).toEqual({});
  });
});
