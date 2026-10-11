import { describe, expect, it } from "vitest";
import { REJECTION_REASONS } from "../constants/request-review.constants";
import { buildRejectionReason } from "./build-rejection-reason";

describe("buildRejectionReason", () => {
  it("sin motivo elegido no es válido y no muestra error", () => {
    expect(buildRejectionReason(null, "texto")).toMatchObject({ reason: "", isValid: false, error: null });
  });

  it.each(REJECTION_REASONS.slice(0, 4))("el motivo %s solo es válido sin indicación", (choice) => {
    expect(buildRejectionReason(choice, "   ")).toEqual({ reason: choice, length: choice.length, isValid: true, error: null });
  });

  it("une el motivo y la indicación en una sola cadena", () => {
    const result = buildRejectionReason("Documento ilegible", "  Sube el PDF original.  ");
    expect(result.reason).toBe("Documento ilegible. Sube el PDF original.");
    expect(result.isValid).toBe(true);
  });

  it("Otro motivo exige una indicación no vacía", () => {
    expect(buildRejectionReason("Otro motivo", "   ")).toMatchObject({ isValid: false, error: "Escribe la indicación para el solicitante" });
    expect(buildRejectionReason("Otro motivo", "Falta el sello")).toMatchObject({ reason: "Otro motivo. Falta el sello", isValid: true });
  });

  it("acepta 500 caracteres y bloquea 501", () => {
    const base = "Documento ilegible. ";
    const ok = buildRejectionReason("Documento ilegible", "a".repeat(500 - base.length));
    expect(ok).toMatchObject({ length: 500, isValid: true });
    const tooLong = buildRejectionReason("Documento ilegible", "a".repeat(501 - base.length));
    expect(tooLong).toMatchObject({ length: 501, isValid: false, error: "El motivo no puede superar los 500 caracteres" });
  });

  it("tolera una indicación indefinida", () => {
    expect(buildRejectionReason("Documento ilegible", undefined as unknown as string).isValid).toBe(true);
  });
});
