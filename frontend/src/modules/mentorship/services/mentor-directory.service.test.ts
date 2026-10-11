import { apiClient } from "@/shared/services/api-client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getMentorDirectory } from "./mentor-directory.service";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getMentorDirectory", () => {
  it("returns the active mentor directory from the real API endpoint", async () => {
    const mentors = [
      {
        id: "0424f370-00f0-43cf-9b8a-997af81840b9",
        fullName: "María Fernanda Rodríguez",
        headline: "Desarrolladora Backend Senior",
        technicalAreas: ["Backend", "APIs"],
      },
      {
        id: "0fa5e6de-63a4-430e-87fb-22f5eb700ecd",
        fullName: "Carlos Andrés Vargas",
        headline: null,
        technicalAreas: [],
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
    expect(result).toBe(mentors);
  });
});
