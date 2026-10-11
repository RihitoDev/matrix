import { apiClient } from "@/shared/services/api-client";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getMentorOrientationTypes,
  getOrientationTypes,
  updateMentorOrientationTypes,
} from "./orientation-type.service";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getOrientationTypes", () => {
  it("returns the orientation types from the API", async () => {
    const orientationTypes = [
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        name: "Orientación profesional",
        description: null,
      },
    ];
    const request = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        statusCode: 200,
        ok: true,
        detail: "Operación exitosa",
        data: orientationTypes,
      },
    });

    const signal = new AbortController().signal;
    const result = await getOrientationTypes(signal);

    expect(request).toHaveBeenCalledWith("/orientation-types", { signal });
    expect(result).toBe(orientationTypes);
  });

  it("returns the current mentor orientation types from the API", async () => {
    const orientationTypes = [
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        name: "Orientación profesional",
        description: null,
      },
    ];
    const signal = new AbortController().signal;
    const request = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        statusCode: 200,
        ok: true,
        detail: "Operación exitosa",
        data: orientationTypes,
      },
    });

    const result = await getMentorOrientationTypes(signal);

    expect(request).toHaveBeenCalledWith("/mentors/me/orientation-types", {
      signal,
    });
    expect(result).toBe(orientationTypes);
  });

  it("updates the mentor orientation types with the exact payload", async () => {
    const orientationTypeIds = [
      "550e8400-e29b-41d4-a716-446655440002",
      "0424f370-00f0-43cf-9b8a-997af81840b9",
    ];
    const request = vi
      .spyOn(apiClient, "patch")
      .mockResolvedValue({
        data: {
          statusCode: 200,
          ok: true,
          detail: "Operación exitosa",
          data: { orientationTypeIds },
        },
      });

    await expect(
      updateMentorOrientationTypes(orientationTypeIds),
    ).resolves.toBeUndefined();

    expect(request).toHaveBeenCalledWith("/mentors/me/orientation-types", {
      orientationTypeIds,
    });
  });
});
