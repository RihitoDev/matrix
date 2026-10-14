import { AxiosError } from "axios";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/shared/testing/create-query-wrapper";
import { jobOffersService } from "../services/job-offers.service";
import { COMPANY_ID, EMPTY_CONDITIONS, VALID_CONDITIONS } from "../testing/vacancy-fixtures";
import { toJobOfferPayload } from "../utils/to-job-offer-payload";
import { usePublishJobOffer } from "./use-publish-job-offer";

vi.mock("../services/job-offers.service", () => ({ jobOffersService: { publish: vi.fn() } }));

const CREATED = { id: "1", createdAt: "2026-10-12T00:00:00.000Z" };

function renderPublishHook() {
  return renderHook(() => usePublishJobOffer(), createQueryWrapper());
}

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
    vi.mocked(jobOffersService.publish).mockResolvedValue(CREATED);
    const { result } = renderPublishHook();

    await act(() => result.current.submit(VALID_CONDITIONS));

    expect(jobOffersService.publish).toHaveBeenCalledWith(COMPANY_ID, toJobOfferPayload(VALID_CONDITIONS));
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("deja el botón reintentable y conserva el error si falla la red", async () => {
    vi.mocked(jobOffersService.publish).mockRejectedValue(new AxiosError("Network Error", "ERR_NETWORK"));
    const { result } = renderPublishHook();

    await act(() => result.current.submit(VALID_CONDITIONS));

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error?.kind).toBe("network");
  });

  it("marca el envío en curso y no repite la petición mientras tanto", async () => {
    let resolvePublish: (value: typeof CREATED) => void = () => {};
    vi.mocked(jobOffersService.publish).mockReturnValue(new Promise((resolve) => { resolvePublish = resolve; }));
    const { result } = renderPublishHook();

    let first: Promise<void> = Promise.resolve();
    act(() => { first = result.current.submit(VALID_CONDITIONS); });
    await waitFor(() => expect(result.current.isSubmitting).toBe(true));
    expect(result.current.status).toBe("submitting");
    await act(() => result.current.submit(VALID_CONDITIONS));

    expect(jobOffersService.publish).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolvePublish(CREATED);
      await first;
    });
    await waitFor(() => expect(result.current.status).toBe("success"));
  });

  it("no llama al backend si el formulario está incompleto", async () => {
    const { result } = renderPublishHook();

    await act(() => result.current.submit(EMPTY_CONDITIONS));

    expect(jobOffersService.publish).not.toHaveBeenCalled();
    expect(result.current.error?.kind).toBe("validation");
    expect(result.current.status).toBe("error");
  });

  it("no llama al backend si no hay empresa asociada a la sesión", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_COMPANY_ID", "");
    const { result } = renderPublishHook();

    await act(() => result.current.submit(VALID_CONDITIONS));

    expect(jobOffersService.publish).not.toHaveBeenCalled();
    expect(result.current.error?.kind).toBe("company");
  });

  it("vuelve a idle al reiniciar", async () => {
    vi.mocked(jobOffersService.publish).mockResolvedValue(CREATED);
    const { result } = renderPublishHook();
    await act(() => result.current.submit(VALID_CONDITIONS));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    act(() => result.current.reset());

    await waitFor(() => expect(result.current.status).toBe("idle"));
    expect(result.current.error).toBeNull();
  });
});
