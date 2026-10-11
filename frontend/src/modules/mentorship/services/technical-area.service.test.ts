import { apiClient } from "@/shared/services/api-client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getTechnicalAreas } from "./technical-area.service";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getTechnicalAreas", () => {
  it("returns the technical areas from the API", async () => {
    const technicalAreas = [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "Backend",
        description: "Desarrollo backend",
      },
    ];
    const request = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        statusCode: 200,
        ok: true,
        detail: "Operación exitosa",
        data: technicalAreas,
      },
    });

    const result = await getTechnicalAreas();

    expect(request).toHaveBeenCalledWith("/technical-areas", { signal: undefined });
    expect(result).toBe(technicalAreas);
  });

  it("forwards the AbortSignal to the API", async () => {
    const signal = new AbortController().signal;
    const request = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        statusCode: 200,
        ok: true,
        detail: "Operación exitosa",
        data: [],
      },
    });
    await expect(getTechnicalAreas(signal)).resolves.toEqual([]);
    expect(request).toHaveBeenCalledWith("/technical-areas", { signal });
  });
});
