import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/services/api-client";
import { ACCESS_TOKEN_STORAGE_KEY } from "@/modules/profile/config/auth-storage.config";
import type { Certification } from "../types/certification.types";
import type { CreateCertificationDto } from "../types/create-certification-dto.types";

vi.mock("@/shared/services/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
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

const AUTH_HEADERS = { Authorization: "Bearer token-123" };

const NOT_FOUND_ERROR = { response: { status: 404 } };
const NETWORK_ERROR = new Error("Network Error");
const SERVER_ERROR = { response: { status: 500 } };

async function loadService() {
  const { certificationsService } = await import("./certifications.service");
  return certificationsService;
}

type CertificationsService = Awaited<ReturnType<typeof loadService>>;

function makeEndpointsUnavailable() {
  vi.mocked(apiClient.get).mockRejectedValue(NOT_FOUND_ERROR);
  vi.mocked(apiClient.post).mockRejectedValue(NOT_FOUND_ERROR);
  vi.mocked(apiClient.patch).mockRejectedValue(NOT_FOUND_ERROR);
  vi.mocked(apiClient.put).mockRejectedValue(NOT_FOUND_ERROR);
  vi.mocked(apiClient.delete).mockRejectedValue(NOT_FOUND_ERROR);
}

describe("certificationsService", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    window.sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, "token-123");
  });

  describe("without an access token", () => {
    it("sends the requests without an authorization header", async () => {
      window.sessionStorage.clear();
      vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [] } });
      const service = await loadService();

      await service.getCertifications();

      expect(apiClient.get).toHaveBeenCalledWith("/certifications", { headers: {} });
    });
  });

  describe("with the endpoints available", () => {
    it("gets the certifications of the current user", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [SAVED_CERTIFICATION] } });
      const service = await loadService();

      await expect(service.getCertifications()).resolves.toEqual([SAVED_CERTIFICATION]);
      expect(apiClient.get).toHaveBeenCalledWith("/certifications", {
        headers: AUTH_HEADERS,
      });
    });

    it("creates a certification", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { data: SAVED_CERTIFICATION } });
      const service = await loadService();

      await expect(service.createCertification(NEW_CERTIFICATION)).resolves.toEqual(
        SAVED_CERTIFICATION,
      );
      expect(apiClient.post).toHaveBeenCalledWith("/certifications", NEW_CERTIFICATION, {
        headers: AUTH_HEADERS,
      });
    });

    it("updates a certification", async () => {
      const updated = { ...SAVED_CERTIFICATION, name: "Professional Scrum Master" };
      vi.mocked(apiClient.patch).mockResolvedValue({ data: { data: updated } });
      const service = await loadService();

      await expect(
        service.updateCertification("certification-1", { name: updated.name }),
      ).resolves.toEqual(updated);
      expect(apiClient.patch).toHaveBeenCalledWith(
        "/certifications/certification-1",
        { name: updated.name },
        { headers: AUTH_HEADERS },
      );
    });

    it("deletes a certification", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({});
      const service = await loadService();

      await service.deleteCertification("certification-1");

      expect(apiClient.delete).toHaveBeenCalledWith("/certifications/certification-1", {
        headers: AUTH_HEADERS,
      });
    });
  });

  describe("with an unexpected server error", () => {
    it.each<[string, (service: CertificationsService) => Promise<unknown>]>([
      ["getCertifications", (service) => service.getCertifications()],
      ["createCertification", (service) => service.createCertification(NEW_CERTIFICATION)],
      ["updateCertification", (service) => service.updateCertification("certification-1", {})],
      ["deleteCertification", (service) => service.deleteCertification("certification-1")],
    ])("rethrows the error from %s", async (_name, call) => {
      vi.mocked(apiClient.get).mockRejectedValue(SERVER_ERROR);
      vi.mocked(apiClient.post).mockRejectedValue(SERVER_ERROR);
      vi.mocked(apiClient.patch).mockRejectedValue(SERVER_ERROR);
      vi.mocked(apiClient.delete).mockRejectedValue(SERVER_ERROR);
      const service = await loadService();

      await expect(call(service)).rejects.toBe(SERVER_ERROR);
    });
  });

  describe("with the endpoints unavailable", () => {
    it.each<[string, (service: CertificationsService) => Promise<unknown>]>([
      ["getCertifications", (service) => service.getCertifications()],
      ["createCertification", (service) => service.createCertification(NEW_CERTIFICATION)],
      ["updateCertification", (service) => service.updateCertification("certification-1", {})],
      ["deleteCertification", (service) => service.deleteCertification("certification-1")],
    ])("propagates the not found error from %s without local data", async (_name, call) => {
      makeEndpointsUnavailable();
      const service = await loadService();

      await expect(call(service)).rejects.toBe(NOT_FOUND_ERROR);
    });

    it("propagates network errors", async () => {
      vi.mocked(apiClient.get).mockRejectedValue(NETWORK_ERROR);
      const service = await loadService();

      await expect(service.getCertifications()).rejects.toBe(NETWORK_ERROR);
    });
  });

  describe("certification documents", () => {
    const DOCUMENT = new File(["certificate"], "certificate.pdf", { type: "application/pdf" });

    it("uploads the document as multipart form data", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({});
      const service = await loadService();

      await service.uploadDocument("certification-1", DOCUMENT);

      const [endpoint, body, config] = vi.mocked(apiClient.put).mock.calls[0] as [
        string,
        FormData,
        unknown,
      ];
      expect(endpoint).toBe("/certifications/certification-1/document");
      expect(body.get("file")).toBe(DOCUMENT);
      expect(config).toEqual({ headers: AUTH_HEADERS });
    });

    it("gets the document as a blob", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: DOCUMENT });
      const service = await loadService();

      await expect(service.getDocument("certification-1")).resolves.toBe(DOCUMENT);
      expect(apiClient.get).toHaveBeenCalledWith("/certifications/certification-1/document", {
        responseType: "blob",
        headers: AUTH_HEADERS,
      });
    });

    it("returns null when the certification has no document", async () => {
      vi.mocked(apiClient.get).mockRejectedValue(NOT_FOUND_ERROR);
      const service = await loadService();

      await expect(service.getDocument("certification-1")).resolves.toBeNull();
    });

    it("deletes the document", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({});
      const service = await loadService();

      await service.deleteDocument("certification-1");

      expect(apiClient.delete).toHaveBeenCalledWith("/certifications/certification-1/document", {
        headers: AUTH_HEADERS,
      });
    });

    it.each<[string, (service: CertificationsService) => Promise<unknown>]>([
      ["uploadDocument", (service) => service.uploadDocument("certification-1", DOCUMENT)],
      ["getDocument", (service) => service.getDocument("certification-1")],
      ["deleteDocument", (service) => service.deleteDocument("certification-1")],
    ])("rethrows server errors from %s", async (_name, call) => {
      vi.mocked(apiClient.get).mockRejectedValue(SERVER_ERROR);
      vi.mocked(apiClient.put).mockRejectedValue(SERVER_ERROR);
      vi.mocked(apiClient.delete).mockRejectedValue(SERVER_ERROR);
      const service = await loadService();

      await expect(call(service)).rejects.toBe(SERVER_ERROR);
    });
  });
});
