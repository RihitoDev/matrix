import { describe, expect, it } from "vitest";
import { REJECTION_REASONS } from "../constants/request-review.constants";
import { buildRejectionReason } from "./build-rejection-reason";

const CHOICE = "Documento ilegible";
const RESERVED = CHOICE.length + 2;

describe("buildRejectionReason", () => {
  it("sin motivo elegido no es válido, no muestra error y la indicación cuenta sola", () => {
    expect(buildRejectionReason(null, "texto")).toEqual({
      reason: "",
      hintLength: 5,
      hintMaxLength: 500,
      reservedLength: 0,
      isValid: false,
      error: null,
    });
  });

  it.each(REJECTION_REASONS.slice(0, 4))("el motivo %s solo es válido sin indicación y la cuenta queda en 0", (choice) => {
    expect(buildRejectionReason(choice, "   ")).toMatchObject({ reason: choice, hintLength: 0, isValid: true, error: null });
  });

  it("une el motivo y la indicación en una sola cadena", () => {
    const result = buildRejectionReason(CHOICE, "  Sube el PDF original.  ");
    expect(result.reason).toBe("Documento ilegible. Sube el PDF original.");
    expect(result.hintLength).toBe("Sube el PDF original.".length);
    expect(result.isValid).toBe(true);
  });

  it("Otro motivo exige una indicación no vacía", () => {
    expect(buildRejectionReason("Otro motivo", "   ")).toMatchObject({ isValid: false, error: "Escribe la indicación para el solicitante" });
    expect(buildRejectionReason("Otro motivo", "Falta el sello")).toMatchObject({ reason: "Otro motivo. Falta el sello", isValid: true });
  });

  it("la indicación vacía cuenta 0 aunque haya un motivo elegido", () => {
    expect(buildRejectionReason(CHOICE, "")).toMatchObject({ hintLength: 0, reservedLength: RESERVED, hintMaxLength: 500 - RESERVED });
  });

  it("el mensaje completo no puede superar 500 caracteres: acepta el límite y bloquea uno más", () => {
    const ok = buildRejectionReason(CHOICE, "a".repeat(500 - RESERVED));
    expect(ok.reason).toHaveLength(500);
    expect(ok).toMatchObject({ isValid: true, error: null });

    const tooLong = buildRejectionReason(CHOICE, "a".repeat(501 - RESERVED));
    expect(tooLong.isValid).toBe(false);
    expect(tooLong.error).toBe(`La indicación no puede superar los ${500 - RESERVED} caracteres`);
  });

  it("sin motivo elegido el mensaje de límite habla de 500 caracteres de la indicación", () => {
    expect(buildRejectionReason(null, "a".repeat(501)).hintMaxLength).toBe(500);
  });

  it("tolera una indicación indefinida", () => {
    expect(buildRejectionReason(CHOICE, undefined as unknown as string).isValid).toBe(true);
  });
});
