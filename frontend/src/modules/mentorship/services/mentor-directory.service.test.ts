import { apiClient } from "@/shared/services/api-client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getMentorDirectory } from "./mentor-directory.service";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getMentorDirectory", () => {
  it.each(["http://localhost:8081/api", "https://dev.umssy.test/api/", "https://umssy.test/api"])(
    "resuelve fotos con %s sin solicitudes por tarjeta", async (baseURL) => {
      const photoUrl = "/mentors/mentor-1/photo?v=2026-10-09";
      const get = vi.spyOn(apiClient, "get").mockResolvedValue({ data: { data: [
        { id: "mentor-1", fullName: "Ana", headline: null, technicalAreas: [], photoUrl,
          education: { degree: "Ingeniería", institution: "UMSS" }, isAvailable: true,
          orientationTypes: ["Orientación técnica"] },
        { id: "mentor-2", fullName: "Luis", headline: null, technicalAreas: [], photoUrl: null,
          education: null, isAvailable: false, orientationTypes: [] },
      ] } });
      const previousBaseURL = apiClient.defaults.baseURL;
      apiClient.defaults.baseURL = baseURL;
      try {
        const result = await getMentorDirectory();
        expect(result[0].photoUrl).toBe(`${baseURL.replace(/\/$/, "")}${photoUrl}`);
        expect(result[0].orientationTypes).toEqual(["Orientación técnica"]);
        expect(result[0].education).toEqual({ degree: "Ingeniería", institution: "UMSS" });
        expect(result[1].photoUrl).toBeNull();
        expect(result[1].orientationTypes).toEqual([]);
        expect(get).toHaveBeenCalledTimes(1);
      } finally {
        apiClient.defaults.baseURL = previousBaseURL;
      }
    },
  );
  it("returns the active mentor directory from the real API endpoint", async () => {
    const mentors = [
      {
        id: "0424f370-00f0-43cf-9b8a-997af81840b9",
        fullName: "María Fernanda Rodríguez",
        headline: "Desarrolladora Backend Senior",
        technicalAreas: ["Backend", "APIs"],
        photoUrl: null,
        education: null,
        isAvailable: false,
        orientationTypes: [],
      },
      {
        id: "0fa5e6de-63a4-430e-87fb-22f5eb700ecd",
        fullName: "Carlos Andrés Vargas",
        headline: null,
        technicalAreas: [],
        photoUrl: null,
        education: null,
        isAvailable: false,
        orientationTypes: [],
      },
    ];
    const signal = new AbortController().signal;
    const request = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        statusCode: 200,
        ok: true,
        detail: "Operación exitosa",
        data: mentors,
      },
    });

    const result = await getMentorDirectory(signal);

    expect(request).toHaveBeenCalledWith("/mentors", { signal });
    expect(result).toEqual(mentors);
  });
});
