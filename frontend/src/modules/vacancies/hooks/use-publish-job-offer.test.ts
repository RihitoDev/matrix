import { AxiosError } from "axios";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { COMPANY_ID, EMPTY_CONDITIONS, VALID_CONDITIONS } from "../testing/vacancy-fixtures";
import { jobOffersService } from "../services/job-offers.service";
import { toJobOfferPayload } from "../utils/to-job-offer-payload";
import { usePublishJobOffer } from "./use-publish-job-offer";

vi.mock("../services/job-offers.service", () => ({ jobOffersService: { publish: vi.fn() } }));

describe("usePublishJobOffer", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_COMPANY_ID", COMPANY_ID);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("publica con la empresa configurada y el payload del backend", async () => {
    vi.mocked(jobOffersService.publish).mockResolvedValue({ id: "1", fechaCreacion: "", mensaje: "ok" });
    const { result } = renderHook(() => usePublishJobOffer());

    await act(() => result.current.submit(VALID_CONDITIONS));

    expect(jobOffersService.publish).toHaveBeenCalledWith(COMPANY_ID, toJobOfferPayload(VALID_CONDITIONS));
    expect(result.current.status).toBe("success");
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("deja el botón reintentable y conserva el error si falla la red", async () => {
    vi.mocked(jobOffersService.publish).mockRejectedValue(new AxiosError("Network Error", "ERR_NETWORK"));
    const { result } = renderHook(() => usePublishJobOffer());

    await act(() => result.current.submit(VALID_CONDITIONS));

    expect(result.current.status).toBe("error");
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error?.kind).toBe("network");
  });

  it("ignora un segundo clic mientras la petición está en curso", async () => {
    let resolvePublish: (value: { id: string; fechaCreacion: string; mensaje: string }) => void = () => {};
    vi.mocked(jobOffersService.publish).mockReturnValue(new Promise((resolve) => { resolvePublish = resolve; }));
    const { result } = renderHook(() => usePublishJobOffer());

    let first: Promise<void> = Promise.resolve();
    act(() => { first = result.current.submit(VALID_CONDITIONS); });
    expect(result.current.isSubmitting).toBe(true);
    await act(() => result.current.submit(VALID_CONDITIONS));

    expect(jobOffersService.publish).toHaveBeenCalledTimes(1);
    await act(async () => { resolvePublish({ id: "1", fechaCreacion: "", mensaje: "ok" }); await first; });
    expect(result.current.status).toBe("success");
  });

  it("no llama al backend si el formulario está incompleto", async () => {
    const { result } = renderHook(() => usePublishJobOffer());

    await act(() => result.current.submit(EMPTY_CONDITIONS));

    expect(jobOffersService.publish).not.toHaveBeenCalled();
    expect(result.current.error?.kind).toBe("validation");
  });

  it("no llama al backend si no hay empresa asociada a la sesión", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_COMPANY_ID", "");
    const { result } = renderHook(() => usePublishJobOffer());

    await act(() => result.current.submit(VALID_CONDITIONS));

    expect(jobOffersService.publish).not.toHaveBeenCalled();
    expect(result.current.error?.kind).toBe("company");
  });

  it("vuelve a idle al reiniciar", async () => {
    vi.mocked(jobOffersService.publish).mockResolvedValue({ id: "1", fechaCreacion: "", mensaje: "ok" });
    const { result } = renderHook(() => usePublishJobOffer());
    await act(() => result.current.submit(VALID_CONDITIONS));

    act(() => result.current.reset());

    expect(result.current.status).toBe("idle");
    expect(result.current.error).toBeNull();
  });
});
