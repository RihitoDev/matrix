import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CERTIFICATION_FEEDBACK_MESSAGES } from "../config/certification-feedback.config";
import { certificationsService } from "../services/certifications.service";
import type { Certification } from "../types/certification.types";
import type { CreateCertificationDto } from "../types/create-certification-dto.types";
import { useCreateCertification, useUpdateCertification } from "./use-certification-mutations";

vi.mock("../services/certifications.service", () => ({
  certificationsService: {
    createCertification: vi.fn(),
    updateCertification: vi.fn(),
  },
}));

const NEW_CERTIFICATION: CreateCertificationDto = {
  name: "Scrum Master",
  issuingOrganization: "Scrum Alliance",
  issueDate: "2025-04-20",
};

const SAVED_CERTIFICATION: Certification = {
  id: "certification-1",
  ...NEW_CERTIFICATION,
  createdAt: "2025-04-21T10:00:00.000Z",
  updatedAt: "2025-04-21T10:00:00.000Z",
};

describe("useCreateCertification", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates the certification and reports the success", async () => {
    vi.mocked(certificationsService.createCertification).mockResolvedValue(SAVED_CERTIFICATION);
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useCreateCertification({ onSuccess }));

    let certification: Certification | null = null;
    await act(async () => {
      certification = await result.current.mutate(NEW_CERTIFICATION);
    });

    expect(certification).toEqual(SAVED_CERTIFICATION);
    expect(certificationsService.createCertification).toHaveBeenCalledWith(NEW_CERTIFICATION);
    expect(onSuccess).toHaveBeenCalledWith(SAVED_CERTIFICATION);
    expect(result.current.isPending).toBe(false);
    expect(result.current.feedback).toEqual({
      type: "success",
      message: CERTIFICATION_FEEDBACK_MESSAGES.createSuccess,
    });
  });

  it("reports the error when the creation fails", async () => {
    vi.mocked(certificationsService.createCertification).mockRejectedValue(new Error("failed"));
    const { result } = renderHook(() => useCreateCertification());

    let certification: Certification | null = SAVED_CERTIFICATION;
    await act(async () => {
      certification = await result.current.mutate(NEW_CERTIFICATION);
    });

    expect(certification).toBeNull();
    expect(result.current.feedback).toEqual({
      type: "error",
      message: CERTIFICATION_FEEDBACK_MESSAGES.createError,
    });
  });

  it("is pending while the request is in progress", async () => {
    let resolveRequest: (certification: Certification) => void = () => undefined;
    vi.mocked(certificationsService.createCertification).mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const { result } = renderHook(() => useCreateCertification());

    let request: Promise<Certification | null> = Promise.resolve(null);
    act(() => {
      request = result.current.mutate(NEW_CERTIFICATION);
    });

    expect(result.current.isPending).toBe(true);

    await act(async () => {
      resolveRequest(SAVED_CERTIFICATION);
      await request;
    });

    expect(result.current.isPending).toBe(false);
  });

  it("clears the feedback", async () => {
    vi.mocked(certificationsService.createCertification).mockResolvedValue(SAVED_CERTIFICATION);
    const { result } = renderHook(() => useCreateCertification());

    await act(async () => {
      await result.current.mutate(NEW_CERTIFICATION);
    });
    act(() => {
      result.current.clearFeedback();
    });

    expect(result.current.feedback).toBeNull();
  });
});

describe("useUpdateCertification", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("updates the certification and reports the success", async () => {
    const updated = { ...SAVED_CERTIFICATION, name: "Professional Scrum Master" };
    vi.mocked(certificationsService.updateCertification).mockResolvedValue(updated);
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useUpdateCertification({ onSuccess }));

    await act(async () => {
      await result.current.mutate({ id: updated.id, data: { name: updated.name } });
    });

    expect(certificationsService.updateCertification).toHaveBeenCalledWith(updated.id, {
      name: updated.name,
    });
    expect(onSuccess).toHaveBeenCalledWith(updated);
    expect(result.current.feedback).toEqual({
      type: "success",
      message: CERTIFICATION_FEEDBACK_MESSAGES.updateSuccess,
    });
  });

  it("reports the error when the update fails", async () => {
    vi.mocked(certificationsService.updateCertification).mockRejectedValue(new Error("failed"));
    const { result } = renderHook(() => useUpdateCertification());

    await act(async () => {
      await result.current.mutate({ id: "certification-1", data: {} });
    });

    expect(result.current.feedback).toEqual({
      type: "error",
      message: CERTIFICATION_FEEDBACK_MESSAGES.updateError,
    });
  });
});
