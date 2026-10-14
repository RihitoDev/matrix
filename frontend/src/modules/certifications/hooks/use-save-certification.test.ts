import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CERTIFICATION_FEEDBACK_MESSAGES } from "../config/certification-feedback.config";
import { certificationsService } from "../services/certifications.service";
import type { Certification } from "../types/certification.types";
import type { CertificationSaveResult } from "../types/certification-save-result.types";
import { useSaveCertification } from "./use-save-certification";

vi.mock("../services/certifications.service", () => ({
  certificationsService: {
    createCertification: vi.fn(),
    updateCertification: vi.fn(),
    deleteCertification: vi.fn(),
  },
}));

const VALUES = { name: "CCNA", issuingOrganization: "Cisco", issueDate: "2024-01-15" };
const FILE = new File(["certificate"], "certificate.pdf", { type: "application/pdf" });
const REPLACE = { type: "replace", file: FILE } as const;
const UPLOAD_ERROR = "No se pudo adjuntar el documento.";

function createCertification(id: string): Certification {
  return {
    id,
    ...VALUES,
    hasDocument: false,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  };
}

function renderSave(applyDocumentChange = vi.fn().mockResolvedValue({ ok: true })) {
  const onPersisted = vi.fn();
  const hook = renderHook(() => useSaveCertification({ applyDocumentChange, onPersisted }));
  return { ...hook, applyDocumentChange, onPersisted };
}

async function save(
  hook: ReturnType<typeof renderSave>,
  editingId: string | null,
  change: Parameters<ReturnType<typeof renderSave>["result"]["current"]["save"]>[2] = REPLACE,
) {
  let outcome: CertificationSaveResult = { status: "failed", fileError: null };
  await act(async () => {
    outcome = await hook.result.current.save(editingId, VALUES, change);
  });
  return outcome;
}

describe("useSaveCertification", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates the certification and attaches its document", async () => {
    vi.mocked(certificationsService.createCertification).mockResolvedValue(createCertification("ccna"));
    const hook = renderSave();

    const outcome = await save(hook, null);

    expect(outcome).toEqual({ status: "saved" });
    expect(certificationsService.createCertification).toHaveBeenCalledWith(VALUES);
    expect(hook.applyDocumentChange).toHaveBeenCalledWith("ccna", REPLACE);
    expect(hook.onPersisted).toHaveBeenCalledTimes(1);
    expect(hook.result.current.feedback).toEqual({
      type: "success",
      message: CERTIFICATION_FEEDBACK_MESSAGES.createSuccess,
    });
  });

  it("does not touch the document when the creation fails", async () => {
    vi.mocked(certificationsService.createCertification).mockRejectedValue(new Error("failed"));
    const hook = renderSave();

    const outcome = await save(hook, null);

    expect(outcome).toEqual({ status: "failed", fileError: null });
    expect(hook.applyDocumentChange).not.toHaveBeenCalled();
    expect(hook.result.current.feedback?.type).toBe("error");
  });

  it("rolls back the created certification when the document fails and returns the message", async () => {
    vi.mocked(certificationsService.createCertification).mockResolvedValue(createCertification("ccna"));
    vi.mocked(certificationsService.deleteCertification).mockResolvedValue(undefined);
    const hook = renderSave(vi.fn().mockResolvedValue({ ok: false, message: UPLOAD_ERROR }));

    const outcome = await save(hook, null);

    expect(outcome).toEqual({ status: "failed", fileError: UPLOAD_ERROR });
    expect(certificationsService.deleteCertification).toHaveBeenCalledWith("ccna");
    expect(hook.onPersisted).not.toHaveBeenCalled();
    expect(hook.result.current.feedback).toBeNull();
  });

  it("retries without creating a duplicate when the rollback fails", async () => {
    vi.mocked(certificationsService.createCertification).mockResolvedValue(createCertification("ccna"));
    vi.mocked(certificationsService.deleteCertification).mockRejectedValue(new Error("failed"));
    vi.mocked(certificationsService.updateCertification).mockResolvedValue(createCertification("ccna"));
    const applyDocumentChange = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, message: UPLOAD_ERROR })
      .mockResolvedValueOnce({ ok: true });
    const hook = renderSave(applyDocumentChange);

    const first = await save(hook, null);
    const second = await save(hook, null);

    expect(first).toEqual({ status: "failed", fileError: UPLOAD_ERROR });
    expect(second).toEqual({ status: "saved" });
    expect(certificationsService.createCertification).toHaveBeenCalledTimes(1);
    expect(certificationsService.updateCertification).toHaveBeenCalledWith("ccna", VALUES);
    expect(applyDocumentChange).toHaveBeenLastCalledWith("ccna", REPLACE);
  });

  it("creates again after a reset", async () => {
    vi.mocked(certificationsService.createCertification).mockResolvedValue(createCertification("ccna"));
    vi.mocked(certificationsService.deleteCertification).mockRejectedValue(new Error("failed"));
    const applyDocumentChange = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, message: UPLOAD_ERROR })
      .mockResolvedValueOnce({ ok: true });
    const hook = renderSave(applyDocumentChange);

    await save(hook, null);
    act(() => {
      hook.result.current.reset();
    });
    await save(hook, null);

    expect(certificationsService.createCertification).toHaveBeenCalledTimes(2);
    expect(certificationsService.updateCertification).not.toHaveBeenCalled();
  });

  it("updates the fields first and then applies the document change", async () => {
    const order: string[] = [];
    vi.mocked(certificationsService.updateCertification).mockImplementation(async () => {
      order.push("update");
      return createCertification("scrum");
    });
    const hook = renderSave(
      vi.fn().mockImplementation(async () => {
        order.push("document");
        return { ok: true };
      }),
    );

    const outcome = await save(hook, "scrum", { type: "remove" });

    expect(outcome).toEqual({ status: "saved" });
    expect(order).toEqual(["update", "document"]);
    expect(hook.applyDocumentChange).toHaveBeenCalledWith("scrum", { type: "remove" });
    expect(certificationsService.createCertification).not.toHaveBeenCalled();
  });

  it("keeps the fields saved, reloads and reports the document error when editing", async () => {
    vi.mocked(certificationsService.updateCertification).mockResolvedValue(createCertification("scrum"));
    const hook = renderSave(vi.fn().mockResolvedValue({ ok: false, message: UPLOAD_ERROR }));

    const outcome = await save(hook, "scrum");

    expect(outcome).toEqual({ status: "failed", fileError: UPLOAD_ERROR });
    expect(hook.onPersisted).toHaveBeenCalledTimes(1);
    expect(hook.result.current.feedback).toBeNull();
    expect(certificationsService.deleteCertification).not.toHaveBeenCalled();
  });

  it("skips the document when the update of the fields fails", async () => {
    vi.mocked(certificationsService.updateCertification).mockRejectedValue(new Error("failed"));
    const hook = renderSave();

    const outcome = await save(hook, "scrum");

    expect(outcome).toEqual({ status: "failed", fileError: null });
    expect(hook.applyDocumentChange).not.toHaveBeenCalled();
    expect(hook.result.current.feedback).toEqual({
      type: "error",
      message: CERTIFICATION_FEEDBACK_MESSAGES.updateError,
    });
  });

  it("clears the feedback of both mutations", async () => {
    vi.mocked(certificationsService.updateCertification).mockRejectedValue(new Error("failed"));
    const hook = renderSave();

    await save(hook, "scrum");
    act(() => {
      hook.result.current.clearFeedback();
    });

    expect(hook.result.current.feedback).toBeNull();
  });
});
