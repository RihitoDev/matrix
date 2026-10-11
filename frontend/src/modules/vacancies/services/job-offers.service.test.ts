import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/services/api-client";
import { COMPANY_ID, VALID_CONDITIONS } from "../testing/vacancy-fixtures";
import { toJobOfferPayload } from "../utils/to-job-offer-payload";
import { jobOffersService } from "./job-offers.service";

vi.mock("@/shared/services/api-client", () => ({ apiClient: { post: vi.fn() } }));

describe("jobOffersService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("publica la vacante en el endpoint de la empresa y devuelve la oferta creada", async () => {
    const created = { id: "offer-1", fechaCreacion: "2026-10-10T00:00:00.000Z", mensaje: "Oferta publicada correctamente" };
    vi.mocked(apiClient.post).mockResolvedValue({ data: { statusCode: 201, data: created, detail: "", ok: true } });
    const payload = toJobOfferPayload(VALID_CONDITIONS);

    const result = await jobOffersService.publish(COMPANY_ID, payload);

    expect(apiClient.post).toHaveBeenCalledWith(`/v1/empresas/${COMPANY_ID}/ofertas`, payload);
    expect(result).toEqual(created);
  });

  it("propaga el error para que el hook lo traduzca", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new Error("boom"));

    await expect(jobOffersService.publish(COMPANY_ID, toJobOfferPayload(VALID_CONDITIONS))).rejects.toThrow("boom");
  });
});
