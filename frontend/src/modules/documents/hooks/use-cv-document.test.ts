import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { documentsService } from "../services/documents.service";
import type { SavedCv } from "../types/saved-cv.types";
import { useCvDocument } from "./use-cv-document";

vi.mock("../services/documents.service", () => ({
  documentsService: {
    getCv: vi.fn(),
    uploadCv: vi.fn(),
    deleteCv: vi.fn(),
  },
}));

const SAVED_CV: SavedCv = {
  fileName: "CV-Test-User.pdf",
  fileType: "PDF",
  sizeInBytes: 1258291,
  updatedAt: new Date("2026-10-03T12:00:00.000Z"),
};

describe("useCvDocument", () => {
  beforeEach(() => {
    vi.mocked(documentsService.getCv).mockResolvedValue(null);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("starts loading and then exposes the saved cv", async () => {
    vi.mocked(documentsService.getCv).mockResolvedValue(SAVED_CV);

    const { result } = renderHook(() => useCvDocument());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.savedCv).toEqual(SAVED_CV);
    expect(result.current.loadError).toBeNull();
  });

  it("exposes null when the user has no cv", async () => {
    const { result } = renderHook(() => useCvDocument());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.savedCv).toBeNull();
  });

  it("exposes a spanish error when loading fails", async () => {
    vi.mocked(documentsService.getCv).mockRejectedValue(new Error("Network Error"));

    const { result } = renderHook(() => useCvDocument());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.loadError).toBe("No se pudo cargar tu CV. Intenta de nuevo más tarde.");
    expect(result.current.savedCv).toBeNull();
  });

  it("ignores the load result after unmounting", async () => {
    let resolveLoad: (cv: SavedCv | null) => void = () => undefined;
    let rejectLoad: (error: Error) => void = () => undefined;
    vi.mocked(documentsService.getCv)
      .mockReturnValueOnce(new Promise((resolve) => (resolveLoad = resolve)))
      .mockReturnValueOnce(new Promise((_, reject) => (rejectLoad = reject)));

    const first = renderHook(() => useCvDocument());
    first.unmount();
    const second = renderHook(() => useCvDocument());
    second.unmount();

    await act(async () => {
      resolveLoad(SAVED_CV);
      rejectLoad(new Error("Network Error"));
    });

    expect(first.result.current.savedCv).toBeNull();
    expect(first.result.current.isLoading).toBe(true);
    expect(second.result.current.loadError).toBeNull();
  });

  it("stores the uploaded cv and clears a previous load error", async () => {
    vi.mocked(documentsService.getCv).mockRejectedValue(new Error("Network Error"));
    vi.mocked(documentsService.uploadCv).mockResolvedValue(SAVED_CV);
    const file = new File(["%PDF"], "resume.pdf", { type: "application/pdf" });
    const { result } = renderHook(() => useCvDocument());
    await waitFor(() => expect(result.current.loadError).not.toBeNull());

    await act(async () => {
      await result.current.uploadCv(file);
    });

    expect(documentsService.uploadCv).toHaveBeenCalledWith(file);
    expect(result.current.savedCv).toEqual(SAVED_CV);
    expect(result.current.loadError).toBeNull();
  });

  it("does not let a late initial load overwrite a cv uploaded meanwhile", async () => {
    let resolveLoad: (cv: SavedCv | null) => void = () => undefined;
    vi.mocked(documentsService.getCv).mockReturnValueOnce(
      new Promise((resolve) => (resolveLoad = resolve)),
    );
    vi.mocked(documentsService.uploadCv).mockResolvedValue(SAVED_CV);
    const { result } = renderHook(() => useCvDocument());

    await act(async () => {
      await result.current.uploadCv(new File(["%PDF"], "resume.pdf", { type: "application/pdf" }));
    });
    await act(async () => {
      resolveLoad(null);
    });

    expect(result.current.savedCv).toEqual(SAVED_CV);
    expect(result.current.isLoading).toBe(false);
  });

  it("does not let a late initial load bring back a cv deleted meanwhile", async () => {
    let resolveLoad: (cv: SavedCv | null) => void = () => undefined;
    vi.mocked(documentsService.getCv).mockReturnValueOnce(
      new Promise((resolve) => (resolveLoad = resolve)),
    );
    vi.mocked(documentsService.deleteCv).mockResolvedValue(undefined);
    const { result } = renderHook(() => useCvDocument());

    await act(async () => {
      await result.current.deleteCv();
    });
    await act(async () => {
      resolveLoad(SAVED_CV);
    });

    expect(result.current.savedCv).toBeNull();
  });

  it("keeps the current cv when the upload fails", async () => {
    vi.mocked(documentsService.getCv).mockResolvedValue(SAVED_CV);
    vi.mocked(documentsService.uploadCv).mockRejectedValue({ response: { status: 415 } });
    const { result } = renderHook(() => useCvDocument());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(
        result.current.uploadCv(new File(["x"], "photo.pdf", { type: "application/pdf" })),
      ).rejects.toEqual({ response: { status: 415 } });
    });

    expect(result.current.savedCv).toEqual(SAVED_CV);
  });

  it("clears the cv after deleting it", async () => {
    vi.mocked(documentsService.getCv).mockResolvedValue(SAVED_CV);
    vi.mocked(documentsService.deleteCv).mockResolvedValue(undefined);
    const { result } = renderHook(() => useCvDocument());
    await waitFor(() => expect(result.current.savedCv).toEqual(SAVED_CV));

    await act(async () => {
      await result.current.deleteCv();
    });

    expect(documentsService.deleteCv).toHaveBeenCalledTimes(1);
    expect(result.current.savedCv).toBeNull();
  });
});
