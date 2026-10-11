import { describe, expect, it } from "vitest";
import { getCvErrorMessage } from "./get-cv-error-message";

const FALLBACK_MESSAGE = "No se pudo subir tu CV. Intenta de nuevo.";

function createHttpError(status: unknown) {
  return { response: { status } };
}

describe("getCvErrorMessage", () => {
  it.each([
    [400, "El archivo está vacío. Selecciona otro archivo."],
    [401, "Tu sesión no es válida. Inicia sesión nuevamente."],
    [404, "No encontramos tu CV. Recarga la página."],
    [413, "El archivo supera el límite de 5 MB."],
    [415, "El CV debe estar en formato PDF."],
    [422, "El archivo está dañado o incompleto. Selecciona otro PDF."],
  ])("translates the status %i to a spanish message", (status, message) => {
    expect(getCvErrorMessage(createHttpError(status), FALLBACK_MESSAGE)).toBe(message);
  });

  it("uses the fallback message for an unmapped status", () => {
    expect(getCvErrorMessage(createHttpError(500), FALLBACK_MESSAGE)).toBe(FALLBACK_MESSAGE);
  });

  it("uses the fallback message when the error has no response", () => {
    expect(getCvErrorMessage(new Error("Network Error"), FALLBACK_MESSAGE)).toBe(
      FALLBACK_MESSAGE,
    );
  });

  it("uses the fallback message when the status is not a number", () => {
    expect(getCvErrorMessage(createHttpError("415"), FALLBACK_MESSAGE)).toBe(FALLBACK_MESSAGE);
  });

  it("uses the fallback message for errors that are not objects", () => {
    expect(getCvErrorMessage("failed", FALLBACK_MESSAGE)).toBe(FALLBACK_MESSAGE);
    expect(getCvErrorMessage(null, FALLBACK_MESSAGE)).toBe(FALLBACK_MESSAGE);
  });
});
