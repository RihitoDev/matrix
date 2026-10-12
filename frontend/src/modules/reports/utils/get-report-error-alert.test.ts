import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import {
  CONNECTION_ERROR_MESSAGE,
  INTERNAL_ERROR_MESSAGE,
  RATE_LIMIT_MESSAGE,
  SLOW_REQUEST_MESSAGE,
} from "../constants/reports.constants";
import { getReportErrorAlert } from "./get-report-error-alert";

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

describe("getReportErrorAlert", () => {
  it("devuelve una advertencia 408 cuando la solicitud supera el tiempo límite", () => {
    expect(getReportErrorAlert(new AxiosError("timeout", AxiosError.ECONNABORTED))).toEqual({
      variant: "warning",
      message: SLOW_REQUEST_MESSAGE,
    });
  });

  it("devuelve una advertencia cuando el servidor limita las solicitudes (429)", () => {
    expect(getReportErrorAlert(buildHttpError(429))).toEqual({ variant: "warning", message: RATE_LIMIT_MESSAGE });
  });

  it("devuelve un error cuando el servidor falla internamente (500)", () => {
    expect(getReportErrorAlert(buildHttpError(500))).toEqual({ variant: "error", message: INTERNAL_ERROR_MESSAGE });
  });

  it.each([503, 504])("devuelve un error de conexión cuando el servidor responde %i", (status) => {
    expect(getReportErrorAlert(buildHttpError(status))).toEqual({ variant: "error", message: CONNECTION_ERROR_MESSAGE });
  });

  it("devuelve un error de conexión cuando no hay respuesta del servidor", () => {
    expect(getReportErrorAlert(new AxiosError("Network Error", AxiosError.ERR_NETWORK))).toEqual({
      variant: "error",
      message: CONNECTION_ERROR_MESSAGE,
    });
  });

  it("no devuelve aviso para otros errores", () => {
    expect(getReportErrorAlert(buildHttpError(404))).toBeNull();
    expect(getReportErrorAlert(new Error("otro"))).toBeNull();
  });
});
