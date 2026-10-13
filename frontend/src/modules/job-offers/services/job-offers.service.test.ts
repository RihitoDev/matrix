import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/services/api-client";
import { COMPANY_ID, DOCKER, PYTHON, VALID_CONDITIONS } from "../testing/vacancy-fixtures";
import { toJobOfferPayload } from "../utils/to-job-offer-payload";
import { jobOffersService } from "./job-offers.service";

vi.mock("@/shared/services/api-client", () => ({ apiClient: { get: vi.fn(), post: vi.fn() } }));

describe("jobOffersService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("obtiene el catálogo de tecnologías del módulo de vacantes", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { statusCode: 200, ok: true, detail: "", data: [{ ...PYTHON, extra: 1 }, DOCKER] },
    });

    await expect(jobOffersService.getSkillCatalog()).resolves.toEqual([PYTHON, DOCKER]);
    expect(apiClient.get).toHaveBeenCalledWith("/job-offers/skills");
  });

  it("devuelve un catálogo vacío si el backend no envía datos", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { statusCode: 200, ok: true, detail: "", data: null } });

    await expect(jobOffersService.getSkillCatalog()).resolves.toEqual([]);
  });

  it("publica la vacante en el endpoint de la empresa", async () => {
    const created = { id: "offer-1", createdAt: "2026-10-12T00:00:00.000Z" };
    vi.mocked(apiClient.post).mockResolvedValue({ data: { statusCode: 201, data: created, detail: "", ok: true } });
    const payload = toJobOfferPayload(VALID_CONDITIONS);

    await expect(jobOffersService.publish(COMPANY_ID, payload)).resolves.toEqual(created);
    expect(apiClient.post).toHaveBeenCalledWith(`/companies/${COMPANY_ID}/job-offers`, payload);
  });

  it("propaga el error para que el hook lo traduzca", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new Error("boom"));

    await expect(jobOffersService.publish(COMPANY_ID, toJobOfferPayload(VALID_CONDITIONS))).rejects.toThrow("boom");
  });
});
