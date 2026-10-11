import { afterEach, describe, expect, it } from "vitest";
import {
  clearAccessToken,
  getAccessToken,
  saveAccessToken,
} from "./access-token-storage";

describe("access token storage", () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it("stores and reads the access token", () => {
    expect(saveAccessToken("token-value")).toBe(true);
    expect(getAccessToken()).toBe("token-value");
  });

  it("removes the access token", () => {
    saveAccessToken("token-value");

    expect(clearAccessToken()).toBe(true);
    expect(getAccessToken()).toBeNull();
  });
});
