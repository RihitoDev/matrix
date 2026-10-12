import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CERTIFICATION_DOCUMENT_MESSAGES } from "../config/certification-document.config";
import { certificationsService } from "../services/certifications.service";
import type { CertificationDocumentResult } from "../types/certification-document-result.types";
import type { Certification } from "../types/certification.types";
import { useCertificationDocument } from "./use-certification-document";

vi.mock("../services/certifications.service", () => ({
  certificationsService: {
    uploadDocument: vi.fn(),
    getDocument: vi.fn(),
    deleteDocument: vi.fn(),
  },
}));

const DOCUMENT = new File(["certificate"], "certificate.pdf", { type: "application/pdf" });
const FILE_URL = "blob:certificate";

const CERTIFICATION: Certification = {
  id: "certification-1",
  name: "Scrum Master",
  issuingOrganization: "Scrum Alliance",
  issueDate: "2025-04-20",
  hasDocument: true,
  createdAt: "2025-04-21T10:00:00.000Z",
  updatedAt: "2025-04-21T10:00:00.000Z",
};

describe("useCertificationDocument", () => {
  beforeEach(() => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue(FILE_URL);
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe("applyDocumentChange", () => {
    it("does nothing when the document is kept", async () => {
      const { result } = renderHook(() => useCertificationDocument());

      let outcome: CertificationDocumentResult = { ok: false, message: "" };
      await act(async () => {
        outcome = await result.current.applyDocumentChange("certification-1", { type: "keep" });
      });

      expect(outcome).toEqual({ ok: true });
      expect(certificationsService.uploadDocument).not.toHaveBeenCalled();
      expect(certificationsService.deleteDocument).not.toHaveBeenCalled();
      expect(result.current.feedback).toBeNull();
    });

    it("uploads a new document and reports the success", async () => {
      vi.mocked(certificationsService.uploadDocument).mockResolvedValue(undefined);
      const { result } = renderHook(() => useCertificationDocument());

      let outcome: CertificationDocumentResult = { ok: false, message: "" };
      await act(async () => {
        outcome = await result.current.applyDocumentChange("certification-1", {
          type: "replace",
          file: DOCUMENT,
        });
      });

      expect(outcome).toEqual({ ok: true });
      expect(certificationsService.uploadDocument).toHaveBeenCalledWith("certification-1", DOCUMENT);
      expect(result.current.feedback).toEqual({
        type: "success",
        message: CERTIFICATION_DOCUMENT_MESSAGES.uploadSuccess,
      });
    });

    it("returns the error message without global feedback when the upload fails", async () => {
      vi.mocked(certificationsService.uploadDocument).mockRejectedValue(new Error("failed"));
      const { result } = renderHook(() => useCertificationDocument());

      let outcome: CertificationDocumentResult = { ok: true };
      await act(async () => {
        outcome = await result.current.applyDocumentChange("certification-1", {
          type: "replace",
          file: DOCUMENT,
        });
      });

      expect(outcome).toEqual({ ok: false, message: CERTIFICATION_DOCUMENT_MESSAGES.uploadError });
      expect(result.current.feedback).toBeNull();
    });

    it("returns the corrupted file message when the upload is rejected as invalid", async () => {
      vi.mocked(certificationsService.uploadDocument).mockRejectedValue({
        response: { status: 400, data: { data: { code: "CORRUPTED_FILE" } } },
      });
      const { result } = renderHook(() => useCertificationDocument());

      let outcome: CertificationDocumentResult = { ok: true };
      await act(async () => {
        outcome = await result.current.applyDocumentChange("certification-1", {
          type: "replace",
          file: DOCUMENT,
        });
      });

      expect(outcome).toEqual({ ok: false, message: "El archivo adjunto está dañado o no es válido" });
      expect(result.current.feedback).toBeNull();
    });

    it("keeps the generic upload message for a 400 without the corrupted file code", async () => {
      vi.mocked(certificationsService.uploadDocument).mockRejectedValue({
        response: { status: 400, data: { data: { code: "OTHER" } } },
      });
      const { result } = renderHook(() => useCertificationDocument());

      let outcome: CertificationDocumentResult = { ok: true };
      await act(async () => {
        outcome = await result.current.applyDocumentChange("certification-1", {
          type: "replace",
          file: DOCUMENT,
        });
      });

      expect(outcome).toEqual({ ok: false, message: CERTIFICATION_DOCUMENT_MESSAGES.uploadError });
    });

    it("removes the document and reports the success", async () => {
      vi.mocked(certificationsService.deleteDocument).mockResolvedValue(undefined);
      const { result } = renderHook(() => useCertificationDocument());

      await act(async () => {
        await result.current.applyDocumentChange("certification-1", { type: "remove" });
      });

      expect(certificationsService.deleteDocument).toHaveBeenCalledWith("certification-1");
      expect(result.current.feedback).toEqual({
        type: "success",
        message: CERTIFICATION_DOCUMENT_MESSAGES.removeSuccess,
      });
    });

    it("returns the error message without global feedback when the removal fails", async () => {
      vi.mocked(certificationsService.deleteDocument).mockRejectedValue(new Error("failed"));
      const { result } = renderHook(() => useCertificationDocument());

      let outcome: CertificationDocumentResult = { ok: true };
      await act(async () => {
        outcome = await result.current.applyDocumentChange("certification-1", { type: "remove" });
      });

      expect(outcome).toEqual({ ok: false, message: CERTIFICATION_DOCUMENT_MESSAGES.removeError });
      expect(result.current.feedback).toBeNull();
    });
  });

  describe("openDocument", () => {
    it("loads the document into a preview without opening new tabs", async () => {
      const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
      vi.mocked(certificationsService.getDocument).mockResolvedValue(DOCUMENT);
      const { result } = renderHook(() => useCertificationDocument());

      await act(async () => {
        await result.current.openDocument(CERTIFICATION);
      });

      expect(openSpy).not.toHaveBeenCalled();
      expect(certificationsService.getDocument).toHaveBeenCalledWith("certification-1");
      expect(URL.createObjectURL).toHaveBeenCalledWith(DOCUMENT);
      expect(result.current.preview).toEqual({
        certificationName: "Scrum Master",
        fileName: "Scrum Master.pdf",
        file: DOCUMENT,
        previewUrl: FILE_URL,
      });
      expect(result.current.isOpening).toBe(false);
      expect(result.current.feedback).toBeNull();
    });

    it("uses the name of the file uploaded in this session", async () => {
      vi.mocked(certificationsService.uploadDocument).mockResolvedValue(undefined);
      vi.mocked(certificationsService.getDocument).mockResolvedValue(DOCUMENT);
      const { result } = renderHook(() => useCertificationDocument());

      await act(async () => {
        await result.current.applyDocumentChange("certification-1", { type: "replace", file: DOCUMENT });
      });
      await act(async () => {
        await result.current.openDocument(CERTIFICATION);
      });

      expect(result.current.preview?.fileName).toBe("certificate.pdf");
    });

    it("releases the url when the preview is closed", async () => {
      vi.mocked(certificationsService.getDocument).mockResolvedValue(DOCUMENT);
      const { result } = renderHook(() => useCertificationDocument());

      await act(async () => {
        await result.current.openDocument(CERTIFICATION);
      });
      act(() => {
        result.current.closeDocument();
      });

      expect(result.current.preview).toBeNull();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(FILE_URL);
    });

    it("releases the previous url when another document is opened", async () => {
      vi.mocked(URL.createObjectURL).mockReturnValueOnce("blob:first").mockReturnValueOnce("blob:second");
      vi.mocked(certificationsService.getDocument).mockResolvedValue(DOCUMENT);
      const { result } = renderHook(() => useCertificationDocument());

      await act(async () => {
        await result.current.openDocument(CERTIFICATION);
      });
      await act(async () => {
        await result.current.openDocument(CERTIFICATION);
      });

      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:first");
      expect(result.current.preview?.previewUrl).toBe("blob:second");
    });

    it("releases the url when the hook unmounts", async () => {
      vi.mocked(certificationsService.getDocument).mockResolvedValue(DOCUMENT);
      const { result, unmount } = renderHook(() => useCertificationDocument());

      await act(async () => {
        await result.current.openDocument(CERTIFICATION);
      });
      unmount();

      expect(URL.revokeObjectURL).toHaveBeenCalledWith(FILE_URL);
    });

    it("reports when there is no document", async () => {
      vi.mocked(certificationsService.getDocument).mockResolvedValue(null);
      const { result } = renderHook(() => useCertificationDocument());

      await act(async () => {
        await result.current.openDocument(CERTIFICATION);
      });

      expect(result.current.preview).toBeNull();
      expect(result.current.feedback).toEqual({
        type: "error",
        message: CERTIFICATION_DOCUMENT_MESSAGES.notFound,
      });
    });

    it("reports when the document cannot be loaded", async () => {
      vi.mocked(certificationsService.getDocument).mockRejectedValue(new Error("failed"));
      const { result } = renderHook(() => useCertificationDocument());

      await act(async () => {
        await result.current.openDocument(CERTIFICATION);
      });

      expect(result.current.preview).toBeNull();
      expect(result.current.feedback).toEqual({
        type: "error",
        message: CERTIFICATION_DOCUMENT_MESSAGES.openError,
      });

      act(() => {
        result.current.clearFeedback();
      });

      expect(result.current.feedback).toBeNull();
    });
  });
});
