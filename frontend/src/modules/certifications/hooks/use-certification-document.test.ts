import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CERTIFICATION_DOCUMENT_MESSAGES,
  DOCUMENT_URL_LIFETIME_MS,
} from "../config/certification-document.config";
import { certificationsService } from "../services/certifications.service";
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

function createDocumentTab() {
  return { close: vi.fn(), location: { href: "" } } as unknown as Window;
}

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

      let isApplied = false;
      await act(async () => {
        isApplied = await result.current.applyDocumentChange("certification-1", { type: "keep" });
      });

      expect(isApplied).toBe(true);
      expect(certificationsService.uploadDocument).not.toHaveBeenCalled();
      expect(certificationsService.deleteDocument).not.toHaveBeenCalled();
      expect(result.current.feedback).toBeNull();
    });

    it("uploads a new document and reports the success", async () => {
      vi.mocked(certificationsService.uploadDocument).mockResolvedValue(undefined);
      const { result } = renderHook(() => useCertificationDocument());

      let isApplied = false;
      await act(async () => {
        isApplied = await result.current.applyDocumentChange("certification-1", {
          type: "replace",
          file: DOCUMENT,
        });
      });

      expect(isApplied).toBe(true);
      expect(certificationsService.uploadDocument).toHaveBeenCalledWith("certification-1", DOCUMENT);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.feedback).toEqual({
        type: "success",
        message: CERTIFICATION_DOCUMENT_MESSAGES.uploadSuccess,
      });
    });

    it("reports the error when the upload fails", async () => {
      vi.mocked(certificationsService.uploadDocument).mockRejectedValue(new Error("failed"));
      const { result } = renderHook(() => useCertificationDocument());

      let isApplied = true;
      await act(async () => {
        isApplied = await result.current.applyDocumentChange("certification-1", {
          type: "replace",
          file: DOCUMENT,
        });
      });

      expect(isApplied).toBe(false);
      expect(result.current.feedback).toEqual({
        type: "error",
        message: CERTIFICATION_DOCUMENT_MESSAGES.uploadError,
      });
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

    it("reports the error when the removal fails", async () => {
      vi.mocked(certificationsService.deleteDocument).mockRejectedValue(new Error("failed"));
      const { result } = renderHook(() => useCertificationDocument());

      await act(async () => {
        await result.current.applyDocumentChange("certification-1", { type: "remove" });
      });

      expect(result.current.feedback).toEqual({
        type: "error",
        message: CERTIFICATION_DOCUMENT_MESSAGES.removeError,
      });
    });
  });

  describe("openDocument", () => {
    it("opens the document in a new tab and releases its url later", async () => {
      vi.useFakeTimers();
      const documentTab = createDocumentTab();
      vi.spyOn(window, "open").mockReturnValue(documentTab);
      vi.mocked(certificationsService.getDocument).mockResolvedValue(DOCUMENT);
      const { result } = renderHook(() => useCertificationDocument());

      await act(async () => {
        await result.current.openDocument(CERTIFICATION);
      });

      expect(window.open).toHaveBeenCalledWith("", "_blank");
      expect(certificationsService.getDocument).toHaveBeenCalledWith("certification-1");
      expect(documentTab.location.href).toBe(FILE_URL);
      expect(result.current.isOpening).toBe(false);
      expect(result.current.feedback).toBeNull();

      vi.advanceTimersByTime(DOCUMENT_URL_LIFETIME_MS);

      expect(URL.revokeObjectURL).toHaveBeenCalledWith(FILE_URL);
    });

    it("opens the url directly when the browser blocks the new tab", async () => {
      vi.spyOn(window, "open").mockReturnValue(null);
      vi.mocked(certificationsService.getDocument).mockResolvedValue(DOCUMENT);
      const { result } = renderHook(() => useCertificationDocument());

      await act(async () => {
        await result.current.openDocument(CERTIFICATION);
      });

      expect(window.open).toHaveBeenLastCalledWith(FILE_URL, "_blank");
    });

    it("closes the tab and reports when there is no document", async () => {
      const documentTab = createDocumentTab();
      vi.spyOn(window, "open").mockReturnValue(documentTab);
      vi.mocked(certificationsService.getDocument).mockResolvedValue(null);
      const { result } = renderHook(() => useCertificationDocument());

      await act(async () => {
        await result.current.openDocument(CERTIFICATION);
      });

      expect(documentTab.close).toHaveBeenCalled();
      expect(result.current.feedback).toEqual({
        type: "error",
        message: CERTIFICATION_DOCUMENT_MESSAGES.notFound,
      });
    });

    it("closes the tab and reports when the document cannot be loaded", async () => {
      const documentTab = createDocumentTab();
      vi.spyOn(window, "open").mockReturnValue(documentTab);
      vi.mocked(certificationsService.getDocument).mockRejectedValue(new Error("failed"));
      const { result } = renderHook(() => useCertificationDocument());

      await act(async () => {
        await result.current.openDocument(CERTIFICATION);
      });

      expect(documentTab.close).toHaveBeenCalled();
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
