import type { AxiosHeaders, AxiosRequestConfig } from "axios";
import { afterEach, describe, expect, it } from "vitest";
import { apiClient } from "./api-client";
import {
  clearAccessToken,
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
