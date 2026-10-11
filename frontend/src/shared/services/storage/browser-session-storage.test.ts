import { afterEach, describe, expect, it, vi } from "vitest";
import {
  readSessionStorage,
  removeSessionStorage,
  writeSessionStorage,
} from "./browser-session-storage";

describe("browser session storage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("writes, reads, and removes a value", () => {
    expect(writeSessionStorage("key", "value")).toBe(true);
    expect(readSessionStorage("key")).toBe("value");
    expect(removeSessionStorage("key")).toBe(true);
    expect(readSessionStorage("key")).toBeNull();
  });

  it("is safe when window is unavailable", () => {
    vi.stubGlobal("window", undefined);

    expect(readSessionStorage("key")).toBeNull();
    expect(writeSessionStorage("key", "value")).toBe(false);
    expect(removeSessionStorage("key")).toBe(false);
  });

  it("is safe when browser storage operations fail", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage unavailable");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage unavailable");
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("Storage unavailable");
    });

    expect(readSessionStorage("key")).toBeNull();
    expect(writeSessionStorage("key", "value")).toBe(false);
    expect(removeSessionStorage("key")).toBe(false);
  });
});
