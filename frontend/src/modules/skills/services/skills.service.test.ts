import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/services/api-client";
import { skillsService } from "./skills.service";

vi.mock("@/shared/services/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const PYTHON_ID = "33333333-3333-4333-8333-333333333333";
const PYTHON_RESPONSE = { id: PYTHON_ID, name: "Python", isCustom: false };
const PYTHON_ITEM = { id: PYTHON_ID, name: "Python" };

function wrapResponse<T>(data: T) {
  return { data: { statusCode: 200, data, detail: "OK", ok: true } };
}

describe("skillsService", () => {
  beforeEach(() => {
    sessionStorage.setItem("accessToken", "test-access-token");
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("gets the skills catalog with authorization headers", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(wrapResponse([PYTHON_RESPONSE]));

    await expect(skillsService.getCatalog()).resolves.toEqual([PYTHON_ITEM]);
    expect(apiClient.get).toHaveBeenCalledWith("/skills", {
      headers: { Authorization: "Bearer test-access-token" },
    });
  });

  it("gets the skills of the current user with authorization headers", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(wrapResponse([PYTHON_RESPONSE]));

    await expect(skillsService.getMySkills()).resolves.toEqual([PYTHON_ITEM]);
    expect(apiClient.get).toHaveBeenCalledWith("/profile/me/skills", {
      headers: { Authorization: "Bearer test-access-token" },
    });
  });

  it("registers a custom skill with authorization headers", async () => {
    vi.mocked(apiClient.post).mockResolvedValue(wrapResponse(PYTHON_RESPONSE));

    await expect(skillsService.createCustomSkill("Python")).resolves.toEqual(PYTHON_ITEM);
    expect(apiClient.post).toHaveBeenCalledWith(
      "/skills/custom",
      { name: "Python" },
      { headers: { Authorization: "Bearer test-access-token" } },
    );
  });

  it("saves the skills of the current user with authorization headers", async () => {
    vi.mocked(apiClient.put).mockResolvedValue(wrapResponse([PYTHON_RESPONSE]));

    await expect(skillsService.saveMySkills([PYTHON_ID])).resolves.toEqual([PYTHON_ITEM]);
    expect(apiClient.put).toHaveBeenCalledWith(
      "/profile/me/skills",
      { skillIds: [PYTHON_ID] },
      { headers: { Authorization: "Bearer test-access-token" } },
    );
  });

  it("does not include bearer token when user has no active session", async () => {
    sessionStorage.clear();
    vi.mocked(apiClient.get).mockResolvedValue(wrapResponse([]));

    await skillsService.getMySkills();
    expect(apiClient.get).toHaveBeenCalledWith("/profile/me/skills", { headers: {} });
  });

  it.each([401, 404, 500])("propagates HTTP %i errors without fallback mocks", async (status) => {
    const error = { response: { status } };
    vi.mocked(apiClient.get).mockRejectedValue(error);

    await expect(skillsService.getMySkills()).rejects.toBe(error);
  });

  it("propagates network errors", async () => {
    const error = new Error("Network Error");
    vi.mocked(apiClient.get).mockRejectedValue(error);

    await expect(skillsService.getCatalog()).rejects.toBe(error);
  });
});
