import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/services/api-client";
import type { EducationItem } from "../types/education-item.types";
import { educationsService } from "./educations.service";

vi.mock("@/shared/services/api-client", () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const EDUCATION: EducationItem = {
  id: "11111111-1111-4111-8111-111111111111",
  institution: "Example University",
  degree: "Computer Science",
  startDate: "2021-02-01",
  endDate: "2025-11-30",
  description: "Software development studies.",
  createdAt: "2025-12-01T00:00:00.000Z",
  updatedAt: "2025-12-01T00:00:00.000Z",
};

describe("educationsService", () => {
  beforeEach(() => {
    sessionStorage.setItem("accessToken", "test-access-token");
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.resetAllMocks();
  });

  it("unwraps education records and authenticates with the login token", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { statusCode: 200, data: [EDUCATION], detail: "Success", ok: true },
    });

    await expect(educationsService.getEducations()).resolves.toEqual([EDUCATION]);
    expect(apiClient.get).toHaveBeenCalledWith("/educations", {
      headers: { Authorization: "Bearer test-access-token" },
    });
  });

  it("returns an empty list when the user has no records", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [] } });

    await expect(educationsService.getEducations()).resolves.toEqual([]);
  });

  it("reads the current token on every request", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [] } });
    await educationsService.getEducations();
    sessionStorage.setItem("accessToken", "new-access-token");
    await educationsService.getEducations();

    expect(apiClient.get).toHaveBeenLastCalledWith("/educations", {
      headers: { Authorization: "Bearer new-access-token" },
    });
  });

  it("does not invent credentials when the login token is missing", async () => {
    sessionStorage.clear();
    const error = { response: { status: 401 } };
    vi.mocked(apiClient.get).mockRejectedValue(error);

    await expect(educationsService.getEducations()).rejects.toBe(error);
    expect(apiClient.get).toHaveBeenCalledWith("/educations", { headers: {} });
  });

  it.each([401, 404, 500])("propagates HTTP %i instead of returning sample records", async (status) => {
    const error = { response: { status } };
    vi.mocked(apiClient.get).mockRejectedValue(error);

    await expect(educationsService.getEducations()).rejects.toBe(error);
  });

  it("propagates network failures", async () => {
    const error = new Error("Network Error");
    vi.mocked(apiClient.get).mockRejectedValue(error);

    await expect(educationsService.getEducations()).rejects.toBe(error);
  });

  describe("mutations", () => {
    const PAYLOAD = {
      institution: "Example University",
      degree: "Computer Science",
      startDate: "2021-02-01",
      endDate: "2025-11-30",
      description: null,
    };
    const HEADERS = { headers: { Authorization: "Bearer test-access-token" } };

    it("creates an education record", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { data: EDUCATION } });

      await expect(educationsService.createEducation(PAYLOAD)).resolves.toEqual(EDUCATION);
      expect(apiClient.post).toHaveBeenCalledWith("/educations", PAYLOAD, HEADERS);
    });

    it("updates an education record", async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({ data: { data: EDUCATION } });

      await expect(educationsService.updateEducation(EDUCATION.id, PAYLOAD)).resolves.toEqual(
        EDUCATION,
      );
      expect(apiClient.patch).toHaveBeenCalledWith(`/educations/${EDUCATION.id}`, PAYLOAD, HEADERS);
    });

    it("sends a legacy edit without introducing a missing end date", async () => {
      const payload = {
        institution: PAYLOAD.institution,
        degree: PAYLOAD.degree,
        startDate: PAYLOAD.startDate,
        description: "Updated description",
      };
      vi.mocked(apiClient.patch).mockResolvedValue({ data: { data: { ...EDUCATION, endDate: null } } });
      await educationsService.updateEducation(EDUCATION.id, payload);
      expect(apiClient.patch).toHaveBeenCalledWith(`/educations/${EDUCATION.id}`, payload, HEADERS);
      expect(vi.mocked(apiClient.patch).mock.calls[0][1]).not.toHaveProperty("endDate");
    });

    it("propagates conflicts without substituting a success response", async () => {
      const error = { response: { status: 409 } };
      vi.mocked(apiClient.patch).mockRejectedValue(error);
      await expect(educationsService.updateEducation(EDUCATION.id, PAYLOAD)).rejects.toBe(error);
      expect(apiClient.patch).toHaveBeenCalledTimes(1);
    });

    it("deletes an education record", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({});

      await educationsService.deleteEducation(EDUCATION.id);

      expect(apiClient.delete).toHaveBeenCalledWith(`/educations/${EDUCATION.id}`, HEADERS);
    });

    it("propagates mutation errors without local data", async () => {
      const error = { response: { status: 404 } };
      vi.mocked(apiClient.post).mockRejectedValue(error);
      vi.mocked(apiClient.patch).mockRejectedValue(error);
      vi.mocked(apiClient.delete).mockRejectedValue(error);

      await expect(educationsService.createEducation(PAYLOAD)).rejects.toBe(error);
      await expect(educationsService.updateEducation(EDUCATION.id, PAYLOAD)).rejects.toBe(error);
      await expect(educationsService.deleteEducation(EDUCATION.id)).rejects.toBe(error);
    });
  });
});
