import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/services/api-client";
import type { WorkExperienceItem } from "../types/work-experience-item.types";
import type { WorkExperiencePayload } from "../types/work-experience-payload.types";
import { workExperienceService } from "./work-experience.service";

vi.mock("@/shared/services/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/modules/profile/utils/get-auth-headers", () => ({
  getAuthHeaders: () => ({ Authorization: "Bearer token-123" }),
}));

const PAYLOAD: WorkExperiencePayload = {
  companyName: "Synapse Labs",
  position: "Desarrolladora web",
  startDate: "2025-03-01",
  endDate: null,
  isCurrent: true,
  description: null,
};

const SAVED: WorkExperienceItem = { id: "experience-1", ...PAYLOAD };
const AUTH_CONFIG = { headers: { Authorization: "Bearer token-123" } };

describe("workExperienceService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists the work experiences of the logged user", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [SAVED] } });

    await expect(workExperienceService.getWorkExperiences()).resolves.toEqual([SAVED]);
    expect(apiClient.get).toHaveBeenCalledWith("/work-experiences", AUTH_CONFIG);
  });

  it("creates a work experience", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { data: SAVED } });

    await expect(workExperienceService.createWorkExperience(PAYLOAD)).resolves.toEqual(SAVED);
    expect(apiClient.post).toHaveBeenCalledWith("/work-experiences", PAYLOAD, AUTH_CONFIG);
  });

  it("updates a work experience", async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { data: SAVED } });

    await expect(
      workExperienceService.updateWorkExperience("experience-1", PAYLOAD),
    ).resolves.toEqual(SAVED);
    expect(apiClient.patch).toHaveBeenCalledWith(
      "/work-experiences/experience-1",
      PAYLOAD,
      AUTH_CONFIG,
    );
  });

  it("deletes a work experience", async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({ data: { data: null } });

    await expect(workExperienceService.deleteWorkExperience("experience-1")).resolves.toBeUndefined();
    expect(apiClient.delete).toHaveBeenCalledWith("/work-experiences/experience-1", AUTH_CONFIG);
  });

  it("lets the errors reach the caller", async () => {
    const error = new Error("Network Error");
    vi.mocked(apiClient.get).mockRejectedValue(error);

    await expect(workExperienceService.getWorkExperiences()).rejects.toBe(error);
  });
});
