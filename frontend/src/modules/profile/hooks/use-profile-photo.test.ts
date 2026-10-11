import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { profilePhotoService } from "../services/profile-photo.service";
import { useProfilePhoto } from "./use-profile-photo";

vi.mock("../services/profile-photo.service", () => ({
  profilePhotoService: {
    getPhoto: vi.fn(),
    uploadPhoto: vi.fn(),
    deletePhoto: vi.fn(),
  },
}));

function createPhoto(name = "photo.png", type = "image/png", size = 4): File {
  return new File([new Uint8Array(size)], name, { type });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe("useProfilePhoto", () => {
  let objectUrlCount: number;

  beforeEach(() => {
    objectUrlCount = 0;
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => `blob:photo-${++objectUrlCount}`),
      revokeObjectURL: vi.fn(),
    });
    vi.mocked(profilePhotoService.getPhoto).mockResolvedValue(null);
    vi.mocked(profilePhotoService.uploadPhoto).mockResolvedValue(undefined);
    vi.mocked(profilePhotoService.deletePhoto).mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  async function renderLoaded() {
    const hook = renderHook(() => useProfilePhoto());
    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
    return hook;
  }

  it("shows the saved photo of the user", async () => {
    vi.mocked(profilePhotoService.getPhoto).mockResolvedValue(new Blob(["photo"]));

    const { result } = await renderLoaded();

    expect(result.current.photoUrl).toBe("blob:photo-1");
    expect(result.current.loadError).toBeNull();
  });

  it("keeps the initials without an error when the user has no photo", async () => {
    const { result } = await renderLoaded();

    expect(result.current.photoUrl).toBeNull();
    expect(result.current.loadError).toBeNull();
  });

  it("reports a failed photo download so the user can retry", async () => {
    vi.mocked(profilePhotoService.getPhoto)
      .mockRejectedValueOnce({ response: { status: 500 } })
      .mockResolvedValueOnce(new Blob(["photo"]));

    const { result } = await renderLoaded();
    expect(result.current.loadError).toBe("No se pudo cargar tu fotografía. Intenta de nuevo.");

    await act(() => result.current.reloadPhoto());

    expect(result.current.loadError).toBeNull();
    expect(result.current.photoUrl).toBe("blob:photo-1");
  });

  it("previews the selected photo without uploading it", async () => {
    const { result } = await renderLoaded();

    act(() => result.current.selectPhoto(createPhoto()));

    expect(result.current.previewUrl).toBe("blob:photo-1");
    expect(result.current.photoUrl).toBeNull();
    expect(profilePhotoService.uploadPhoto).not.toHaveBeenCalled();
  });

  it("uploads the previewed photo when it is confirmed", async () => {
    const { result } = await renderLoaded();
    const photo = createPhoto();

    act(() => result.current.selectPhoto(photo));
    await act(() => result.current.confirmPhoto());

    expect(profilePhotoService.uploadPhoto).toHaveBeenCalledWith(photo);
    expect(result.current.photoUrl).toBe("blob:photo-2");
    expect(result.current.previewUrl).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:photo-1");
  });

  it("discards the preview when it is cancelled", async () => {
    const { result } = await renderLoaded();

    act(() => result.current.selectPhoto(createPhoto()));
    act(() => result.current.cancelPhoto());

    expect(result.current.previewUrl).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:photo-1");
    expect(profilePhotoService.uploadPhoto).not.toHaveBeenCalled();
  });

  it("does not preview a file that is not jpg or png", async () => {
    const { result } = await renderLoaded();

    act(() => result.current.selectPhoto(createPhoto("cv.pdf", "application/pdf")));

    expect(result.current.previewUrl).toBeNull();
    expect(result.current.error).toBe("La fotografía debe estar en formato JPG o PNG.");
  });

  it("keeps the preview and shows the server message when the upload fails", async () => {
    vi.mocked(profilePhotoService.uploadPhoto).mockRejectedValue({ response: { status: 415 } });
    const { result } = await renderLoaded();

    act(() => result.current.selectPhoto(createPhoto()));
    await act(() => result.current.confirmPhoto());

    expect(result.current.error).toBe("La fotografía debe estar en formato JPG o PNG.");
    expect(result.current.previewUrl).toBe("blob:photo-1");
    expect(result.current.photoUrl).toBeNull();
  });

  it("deletes the saved photo", async () => {
    vi.mocked(profilePhotoService.getPhoto).mockResolvedValue(new Blob(["photo"]));
    const { result } = await renderLoaded();

    await act(() => result.current.deletePhoto());

    expect(profilePhotoService.deletePhoto).toHaveBeenCalled();
    expect(result.current.photoUrl).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:photo-1");
  });

  it("keeps the photo and shows an error when the deletion fails", async () => {
    vi.mocked(profilePhotoService.getPhoto).mockResolvedValue(new Blob(["photo"]));
    vi.mocked(profilePhotoService.deletePhoto).mockRejectedValue(new Error("Network error"));
    const { result } = await renderLoaded();

    await act(() => result.current.deletePhoto());

    expect(result.current.photoUrl).toBe("blob:photo-1");
    expect(result.current.error).toBe("No se pudo eliminar tu fotografía. Intenta de nuevo.");
  });

  it("does not create an image when the upload finishes after leaving the page", async () => {
    const upload = deferred<void>();
    vi.mocked(profilePhotoService.uploadPhoto).mockReturnValue(upload.promise);
    const { result, unmount } = await renderLoaded();

    act(() => result.current.selectPhoto(createPhoto()));
    const confirmation = result.current.confirmPhoto();
    unmount();
    upload.resolve();
    await confirmation;

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:photo-1");
  });

  it("releases the photo when the component is removed", async () => {
    vi.mocked(profilePhotoService.getPhoto).mockResolvedValue(new Blob(["photo"]));
    const { unmount } = await renderLoaded();

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:photo-1");
  });
});
