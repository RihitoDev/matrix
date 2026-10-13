import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/services/api-client";
import { MENTOR_PROFILE_FIXTURE } from "../testing/mentor-profile.fixture";
import { getMentorProfile } from "./mentor-profile.service";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("mentor profile service", () => {
  it.each([
    "http://localhost:8081/api",
    "https://dev.umssy.test/api/",
    "https://umssy.test/api",
  ])("resuelve la fotografía con la base API %s", async (baseURL) => {
    const photoUrl = `/mentors/${MENTOR_PROFILE_FIXTURE.id}/photo?v=abc`;
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { data: { ...MENTOR_PROFILE_FIXTURE, photoUrl } },
    });
    const previousBaseURL = apiClient.defaults.baseURL;
    apiClient.defaults.baseURL = baseURL;
    try {
      const result = await getMentorProfile(MENTOR_PROFILE_FIXTURE.id);
      expect(result?.photoUrl).toBe(`${baseURL.replace(/\/$/, "")}${photoUrl}`);
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    } finally {
      apiClient.defaults.baseURL = previousBaseURL;
    }
  });

  it("consulta el endpoint real con el UUID y AbortSignal recibidos", async () => {
    const controller = new AbortController();
    const request = vi
      .spyOn(apiClient, "get")
      .mockResolvedValue({
        data: {
          statusCode: 200,
          ok: true,
          detail: "Operación exitosa",
          data: MENTOR_PROFILE_FIXTURE,
        },
      });

    const result = await getMentorProfile(
      MENTOR_PROFILE_FIXTURE.id,
      controller.signal,
    );

    expect(request).toHaveBeenCalledWith(
      `/mentors/${MENTOR_PROFILE_FIXTURE.id}`,
      { signal: controller.signal },
    );
    expect(result).toBe(MENTOR_PROFILE_FIXTURE);
  });

  it.each([400, 404])(
    "devuelve null cuando backend responde %s por mentor inválido",
    async (status) => {
      vi.spyOn(apiClient, "get").mockRejectedValue({
        isAxiosError: true,
        response: { status },
      });

      await expect(
        getMentorProfile(MENTOR_PROFILE_FIXTURE.id),
      ).resolves.toBeNull();
    },
  );

  it("propaga otros errores sin usar fixtures como fallback", async () => {
    const error = {
      isAxiosError: true,
      response: { status: 500 },
    };
    vi.spyOn(apiClient, "get").mockRejectedValue(error);

    await expect(getMentorProfile(MENTOR_PROFILE_FIXTURE.id)).rejects.toBe(
      error,
    );
  });
});
