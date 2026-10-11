import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/services/api-client";
import { ACCESS_TOKEN_STORAGE_KEY } from "@/modules/profile/config/auth-storage.config";
import { documentsService } from "./documents.service";

vi.mock("@/shared/services/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const AUTH_CONFIG = { headers: { Authorization: "Bearer token-123" } };

const CV_RESPONSE = {
  fileName: "CV-Test-User.pdf",
  fileType: "application/pdf",
  sizeInBytes: 1258291,
  updatedAt: "2026-10-03T12:00:00.000Z",
};

const SAVED_CV = {
  fileName: "CV-Test-User.pdf",
  fileType: "PDF",
  sizeInBytes: 1258291,
  updatedAt: new Date("2026-10-03T12:00:00.000Z"),
};

function wrapResponse<T>(data: T) {
  return { data: { statusCode: 200, data, detail: "OK", ok: true } };
}

describe("documentsService", () => {
  beforeEach(() => {
    window.sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, "token-123");
  });

  afterEach(() => {
    window.sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("gets the saved cv of the current user with the access token", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(wrapResponse(CV_RESPONSE));

    await expect(documentsService.getCv()).resolves.toEqual(SAVED_CV);
    expect(apiClient.get).toHaveBeenCalledWith("/profile/me/cv", AUTH_CONFIG);
  });

  it("returns null when the user has no cv", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(wrapResponse(null));

    await expect(documentsService.getCv()).resolves.toBeNull();
  });

  it("sends no authorization header when there is no saved token", async () => {
    window.sessionStorage.clear();
    vi.mocked(apiClient.get).mockResolvedValue(wrapResponse(null));

    await documentsService.getCv();

    expect(apiClient.get).toHaveBeenCalledWith("/profile/me/cv", { headers: {} });
  });

  it("uploads the file as multipart form data in the file field with the access token", async () => {
    const file = new File([new Uint8Array(1024)], "resume.pdf", { type: "application/pdf" });
    vi.mocked(apiClient.put).mockResolvedValue(wrapResponse(CV_RESPONSE));

    await expect(documentsService.uploadCv(file)).resolves.toEqual(SAVED_CV);

    const [url, body, config] = vi.mocked(apiClient.put).mock.calls[0];
    expect(url).toBe("/profile/me/cv");
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("file")).toBe(file);
    expect(config).toEqual(AUTH_CONFIG);
  });

  it("returns null when the upload response has no cv", async () => {
    vi.mocked(apiClient.put).mockResolvedValue(wrapResponse(null));

    await expect(
      documentsService.uploadCv(new File(["%PDF"], "resume.pdf", { type: "application/pdf" })),
    ).resolves.toBeNull();
  });

  it("deletes the cv of the current user with the access token", async () => {
    vi.mocked(apiClient.delete).mockResolvedValue(wrapResponse(null));

    await expect(documentsService.deleteCv()).resolves.toBeUndefined();
    expect(apiClient.delete).toHaveBeenCalledWith("/profile/me/cv", AUTH_CONFIG);
  });

  it("propagates the http error to the caller", async () => {
    const error = { response: { status: 415 } };
    vi.mocked(apiClient.put).mockRejectedValue(error);

    await expect(
      documentsService.uploadCv(new File(["x"], "photo.pdf", { type: "application/pdf" })),
    ).rejects.toBe(error);
  });
});
