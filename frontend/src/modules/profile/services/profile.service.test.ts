import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/services/api-client";
import { ACCESS_TOKEN_STORAGE_KEY } from "../config/auth-storage.config";
import { profileService } from "./profile.service";

vi.mock("@/shared/services/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

const AUTH_CONFIG = { headers: { Authorization: "Bearer test-token" } };

const PROFILE = {
  id: "11111111-1111-4111-8111-111111111111",
  firstName: "Valeria",
  lastName: "Quispe",
  institutionalEmail: "valeria.quispe@umss.edu.bo",
  personalEmail: null,
  phone: null,
  city: null,
  headline: null,
  aboutMe: null,
  updatedAt: "2026-10-04T12:00:00.000Z",
};

function wrapResponse<T>(data: T) {
  return { data: { statusCode: 200, data, detail: "OK", ok: true } };
}

describe("profileService", () => {
  beforeEach(() => {
    window.sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, "test-token");
  });

  afterEach(() => {
    window.sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("gets the profile of the authenticated user", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(wrapResponse(PROFILE));

    await expect(profileService.getProfile()).resolves.toEqual(PROFILE);
    expect(apiClient.get).toHaveBeenCalledWith("/profile/me", AUTH_CONFIG);
  });

  it("gets the cities", async () => {
    const cities = [{ id: "22222222-2222-4222-8222-222222222222", title: "Cochabamba" }];
    vi.mocked(apiClient.get).mockResolvedValue(wrapResponse(cities));

    await expect(profileService.getCities()).resolves.toEqual(cities);
    expect(apiClient.get).toHaveBeenCalledWith("/profile/cities", AUTH_CONFIG);
  });

  it("returns an empty list when the cities response has no data", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(wrapResponse(null));

    await expect(profileService.getCities()).resolves.toEqual([]);
  });

  it("saves the personal information", async () => {
    const values = {
      firstName: "Valeria",
      lastName: "Quispe",
      cityId: "22222222-2222-4222-8222-222222222222",
      phone: "+591 70000000",
      personalEmail: "valeria@correo.com",
    };
    vi.mocked(apiClient.patch).mockResolvedValue(wrapResponse(PROFILE));

    await expect(profileService.updatePersonalInfo(values)).resolves.toEqual(PROFILE);
    expect(apiClient.patch).toHaveBeenCalledWith("/profile/me/personal-info", values, AUTH_CONFIG);
  });

  it("saves the presentation", async () => {
    const payload = { headline: "Junior developer", aboutMe: "Graduate." };
    vi.mocked(apiClient.patch).mockResolvedValue(wrapResponse(PROFILE));

    await expect(profileService.updatePresentation(payload)).resolves.toEqual(PROFILE);
    expect(apiClient.patch).toHaveBeenCalledWith("/profile/me/presentation", payload, AUTH_CONFIG);
  });

  it("propagates request errors", async () => {
    const error = { response: { status: 401 } };
    vi.mocked(apiClient.get).mockRejectedValue(error);

    await expect(profileService.getProfile()).rejects.toBe(error);
  });
});
