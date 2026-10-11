import { describe, expect, it } from "vitest";
import { getSkillsErrorMessage } from "./get-skills-error-message";

const FALLBACK_MESSAGE = "No se pudieron guardar tus habilidades. Intenta de nuevo.";

function createHttpError(status: unknown) {
  return { response: { status } };
}

describe("getSkillsErrorMessage", () => {
  it.each([
    [400, "Revisa las habilidades seleccionadas e intenta de nuevo."],
    [401, "Tu sesión no es válida. Inicia sesión nuevamente."],
    [404, "Alguna habilidad ya no está disponible. Recarga la página."],
    [409, "No puedes agregar la misma habilidad dos veces."],
  ])("translates the status %i to a spanish message", (status, message) => {
    expect(getSkillsErrorMessage(createHttpError(status), FALLBACK_MESSAGE)).toBe(message);
  });

  it("uses the fallback message for an unmapped status", () => {
    expect(getSkillsErrorMessage(createHttpError(500), FALLBACK_MESSAGE)).toBe(FALLBACK_MESSAGE);
  });

  it("uses the fallback message when the status is not a number", () => {
    expect(getSkillsErrorMessage(createHttpError("409"), FALLBACK_MESSAGE)).toBe(
      FALLBACK_MESSAGE,
    );
  });

  it("uses the fallback message when the error has no response or is not an object", () => {
    expect(getSkillsErrorMessage(new Error("Network Error"), FALLBACK_MESSAGE)).toBe(
      FALLBACK_MESSAGE,
    );
    expect(getSkillsErrorMessage("failed", FALLBACK_MESSAGE)).toBe(FALLBACK_MESSAGE);
    expect(getSkillsErrorMessage(null, FALLBACK_MESSAGE)).toBe(FALLBACK_MESSAGE);
  });
});
