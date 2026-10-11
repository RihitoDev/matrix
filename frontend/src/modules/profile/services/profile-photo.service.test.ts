import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/services/api-client";
import { profilePhotoService } from "./profile-photo.service";

vi.mock("@/shared/services/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("profilePhotoService", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("gets the photo of the current user as a blob", async () => {
    const photo = new Blob(["photo"], { type: "image/png" });
    vi.mocked(apiClient.get).mockResolvedValue({ data: photo });

    await expect(profilePhotoService.getPhoto()).resolves.toBe(photo);
    expect(apiClient.get).toHaveBeenCalledWith("/profile/me/photo", {
      responseType: "blob",
      headers: {},
    });
  });

  it("returns null when the user has no photo", async () => {
    vi.mocked(apiClient.get).mockRejectedValue({ response: { status: 404 } });

    await expect(profilePhotoService.getPhoto()).resolves.toBeNull();
  });

  it("rethrows other errors", async () => {
    const error = { response: { status: 401 } };
    vi.mocked(apiClient.get).mockRejectedValue(error);

    await expect(profilePhotoService.getPhoto()).rejects.toBe(error);
  });

  it("uploads the photo as multipart form data", async () => {
    vi.mocked(apiClient.put).mockResolvedValue({});
    const photo = new File(["photo"], "photo.png", { type: "image/png" });

    await profilePhotoService.uploadPhoto(photo);

    const [endpoint, body, config] = vi.mocked(apiClient.put).mock.calls[0] as [
      string,
      FormData,
      { headers: Record<string, string> },
    ];
    expect(config.headers).toEqual({});
    expect(endpoint).toBe("/profile/me/photo");
    expect(body.get("file")).toBe(photo);
  });

  it("deletes the photo of the current user", async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({});

    await profilePhotoService.deletePhoto();

    expect(apiClient.delete).toHaveBeenCalledWith("/profile/me/photo", { headers: {} });
  });
});
