import { renderHook, waitFor } from "@testing-library/react";
import { AxiosError, AxiosHeaders } from "axios";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/shared/testing/create-query-wrapper";
import {
  CONNECTION_ERROR_MESSAGE,
  INTERNAL_ERROR_MESSAGE,
  RATE_LIMIT_MESSAGE,
  REJECTED_USERS_LOAD_ERROR_MESSAGE,
  REPORT_ALERT_DURATION_MS,
  SLOW_REQUEST_MESSAGE,
} from "../constants/reports.constants";
import { reportsService } from "../services/reports.service";
import { useRejectedUsers } from "./use-rejected-users";

vi.mock("sonner", () => ({ toast: { warning: vi.fn(), error: vi.fn() } }));

function buildHttpError(status: number) {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError("Error", undefined, config, undefined, {
    status,
    statusText: "",
    headers: {},
    config,
    data: null,
  });
}

function renderWithError(error: unknown) {
  vi.spyOn(reportsService, "getRejectedUsers").mockRejectedValue(error);
  return renderHook(() => useRejectedUsers(1), { wrapper: createQueryWrapper().wrapper });
}

const toastOptions = expect.objectContaining({ duration: REPORT_ALERT_DURATION_MS, closeButton: true, richColors: true });

describe("useRejectedUsers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(toast.warning).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  it("devuelve los usuarios rechazados de la página pedida", async () => {
    vi.spyOn(reportsService, "getRejectedUsers").mockResolvedValue({
      statusCode: 200,
      data: { items: [], totalItems: 12 },
      detail: "Operación exitosa",
      ok: true,
    });

    const { result } = renderHook(() => useRejectedUsers(1), { wrapper: createQueryWrapper().wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.totalItems).toBe(12);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.errorMessage).toBeUndefined();
  });

  it("avisa con Sonner cuando la solicitud supera el tiempo límite (408)", async () => {
    renderWithError(new AxiosError("timeout", AxiosError.ECONNABORTED));

    await waitFor(() => expect(toast.warning).toHaveBeenCalledWith(SLOW_REQUEST_MESSAGE, toastOptions));
  });

  it("avisa con Sonner cuando el servidor limita las solicitudes (429)", async () => {
    renderWithError(buildHttpError(429));

    await waitFor(() => expect(toast.warning).toHaveBeenCalledWith(RATE_LIMIT_MESSAGE, toastOptions));
  });

  it("avisa con Sonner cuando el servidor falla internamente (500)", async () => {
    renderWithError(buildHttpError(500));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(INTERNAL_ERROR_MESSAGE, toastOptions));
  });

  it.each([503, 504])("avisa con Sonner de un error de conexión cuando el servidor responde %i", async (status) => {
    renderWithError(buildHttpError(status));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(CONNECTION_ERROR_MESSAGE, toastOptions));
  });

  it("avisa con Sonner de un error de conexión cuando no hay respuesta del servidor", async () => {
    renderWithError(new AxiosError("Network Error", AxiosError.ERR_NETWORK));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(CONNECTION_ERROR_MESSAGE, toastOptions));
  });

  it("no muestra aviso para otros errores, pero sí el mensaje de carga fallida", async () => {
    const { result } = renderWithError(buildHttpError(404));

    await waitFor(() => expect(result.current.errorMessage).toBe(REJECTED_USERS_LOAD_ERROR_MESSAGE));
    expect(toast.warning).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("no muestra aviso si el error no viene de la API", async () => {
    const { result } = renderWithError(new Error("otro"));

    await waitFor(() => expect(result.current.errorMessage).toBe(REJECTED_USERS_LOAD_ERROR_MESSAGE));
    expect(toast.warning).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });
});
