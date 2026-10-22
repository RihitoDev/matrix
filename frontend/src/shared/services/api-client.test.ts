import type { AxiosHeaders, AxiosRequestConfig } from "axios";
import { afterEach, describe, expect, it } from "vitest";
import { apiClient } from "./api-client";
import {
  clearAccessToken,
  getAccessToken,
  saveAccessToken,
} from "./storage/access-token-storage";

async function captureRequestHeaders(config: AxiosRequestConfig = {}) {
  let headers: AxiosHeaders | undefined;

  await apiClient.get("/test", {
    ...config,
    adapter: async (requestConfig) => {
      headers = requestConfig.headers;
      return {
        data: null,
        status: 200,
        statusText: "OK",
        headers: {},
        config: requestConfig,
      };
    },
  });

  return headers;
}

describe("apiClient authorization", () => {
  afterEach(() => {
    clearAccessToken();
  });

  it("adds a Bearer token when an access token exists", async () => {
    saveAccessToken("stored-token");

    const headers = await captureRequestHeaders();

    expect(headers?.get("Authorization")).toBe("Bearer stored-token");
  });

  it("does not add Authorization when no access token exists", async () => {
    const headers = await captureRequestHeaders();

    expect(headers?.has("Authorization")).toBe(false);
  });

  it("preserves an explicitly supplied Authorization header", async () => {
    saveAccessToken("stored-token");

    const headers = await captureRequestHeaders({
      headers: { Authorization: "Basic explicit-credentials" },
    });

    expect(headers?.get("Authorization")).toBe("Basic explicit-credentials");
  });
});

describe("apiClient session errors", () => {
  afterEach(clearAccessToken);

  function rejectWithStatus(status: number, tokenDuringResponse?: string) {
    return apiClient.get("/private-resource", {
      adapter: async (config) => {
        if (tokenDuringResponse) saveAccessToken(tokenDuringResponse);
        throw Object.assign(new Error("Solicitud rechazada"), { isAxiosError: true, config, response: { status, data: { detail: "Solicitud rechazada" } } });
      },
    });
  }

  it("invalidates the current session on an authenticated 401 without a mounted guard", async () => {
    saveAccessToken("expired-token");
    await expect(rejectWithStatus(401)).rejects.toThrow("Solicitud rechazada");
    expect(getAccessToken()).toBeNull();
  });

  it("does not invalidate a newer session when an old request returns 401", async () => {
    saveAccessToken("old-token");
    await expect(rejectWithStatus(401, "new-token")).rejects.toThrow();
    expect(getAccessToken()).toBe("new-token");
  });

  it.each([400, 403, 404, 422, 500])("preserves the session and original error on HTTP %s", async (status) => {
    saveAccessToken("valid-token");
    await expect(rejectWithStatus(status)).rejects.toMatchObject({ response: { status, data: { detail: "Solicitud rechazada" } } });
    expect(getAccessToken()).toBe("valid-token");
  });
});
