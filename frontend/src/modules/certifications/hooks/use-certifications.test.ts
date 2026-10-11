import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CERTIFICATION_FEEDBACK_MESSAGES } from "../config/certification-feedback.config";
import { certificationsService } from "../services/certifications.service";
import type { Certification } from "../types/certification.types";
import { useCertifications } from "./use-certifications";

vi.mock("../services/certifications.service", () => ({
  certificationsService: {
    getCertifications: vi.fn(),
  },
}));

function createCertification(id: string, issueDate: string): Certification {
  return {
    id,
    name: `Certification ${id}`,
    issuingOrganization: "Scrum Alliance",
    issueDate,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  };
}

const OLDEST = createCertification("oldest", "2021-02-10");
const NEWEST = createCertification("newest", "2025-08-01");
const MIDDLE = createCertification("middle", "2023-11-15");

function createDeferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe("useCertifications", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads the certifications sorted from the newest to the oldest", async () => {
    vi.mocked(certificationsService.getCertifications).mockResolvedValue([OLDEST, NEWEST, MIDDLE]);
    const { result } = renderHook(() => useCertifications());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.certifications).toEqual([NEWEST, MIDDLE, OLDEST]);
    expect(result.current.error).toBeNull();
  });

  it("reports an error when the certifications cannot be loaded", async () => {
    vi.mocked(certificationsService.getCertifications).mockRejectedValue(new Error("failed"));
    const { result } = renderHook(() => useCertifications());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.certifications).toEqual([]);
    expect(result.current.error).toBe(CERTIFICATION_FEEDBACK_MESSAGES.loadError);
  });

  it("reloads the certifications on demand", async () => {
    vi.mocked(certificationsService.getCertifications).mockResolvedValueOnce([OLDEST]);
    const { result } = renderHook(() => useCertifications());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(certificationsService.getCertifications).mockResolvedValueOnce([OLDEST, NEWEST]);
    await act(async () => {
      await result.current.reload();
    });

    expect(certificationsService.getCertifications).toHaveBeenCalledTimes(2);
    expect(result.current.certifications).toEqual([NEWEST, OLDEST]);
  });

  it("keeps the previous list and clears the error after a successful reload", async () => {
    vi.mocked(certificationsService.getCertifications).mockRejectedValueOnce(new Error("failed"));
    const { result } = renderHook(() => useCertifications());
    await waitFor(() => expect(result.current.error).not.toBeNull());

    vi.mocked(certificationsService.getCertifications).mockResolvedValueOnce([MIDDLE]);
    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.certifications).toEqual([MIDDLE]);
  });

  it("ignores a response that arrives after a newer request", async () => {
    const firstRequest = createDeferred<Certification[]>();
    vi.mocked(certificationsService.getCertifications)
      .mockReturnValueOnce(firstRequest.promise)
      .mockResolvedValueOnce([NEWEST]);
    const { result } = renderHook(() => useCertifications());

    await act(async () => {
      await result.current.reload();
    });
    await act(async () => {
      firstRequest.resolve([OLDEST]);
      await firstRequest.promise;
    });

    expect(result.current.certifications).toEqual([NEWEST]);
  });

  it("ignores the response after unmounting", async () => {
    const request = createDeferred<Certification[]>();
    vi.mocked(certificationsService.getCertifications).mockReturnValueOnce(request.promise);
    const { result, unmount } = renderHook(() => useCertifications());

    unmount();
    await act(async () => {
      request.resolve([OLDEST]);
      await request.promise;
    });

    expect(result.current.certifications).toEqual([]);
  });
});
