import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { toPublishError } from "./to-publish-error";

function responseError(status: number, data: unknown): AxiosError {
  return new AxiosError("fail", "ERR_BAD_RESPONSE", undefined, undefined, { status, data } as AxiosResponse);
}

describe("toPublishError", () => {
  it("distingue la falta de conexión", () => {
    const result = toPublishError(new AxiosError("Network Error", "ERR_NETWORK"));

    expect(result.kind).toBe("network");
    expect(result.message).toMatch(/Sin conexión a internet/);
  });

  it("lista los mensajes de validación (422) que devuelve el backend", () => {
    const result = toPublishError(
      responseError(422, { detail: [{ campo: "tituloPuesto", mensaje: "Este campo es obligatorio" }] }),
    );

    expect(result).toMatchObject({ kind: "validation", details: ["Este campo es obligatorio"] });
  });

  it("usa el detalle de texto de los errores de dominio 422", () => {
    const result = toPublishError(responseError(422, { detail: "El valor indicado para estado no existe." }));

    expect(result.details).toEqual(["El valor indicado para estado no existe."]);
  });

  it("trata como validación el 400 de las reglas de habilidades", () => {
    const result = toPublishError(responseError(400, { detail: "Una o más habilidades no existen en el catálogo." }));

    expect(result).toMatchObject({ kind: "validation", details: ["Una o más habilidades no existen en el catálogo."] });
  });

  it("reconoce empresa inexistente (404) y sesión inválida (401/403)", () => {
    expect(toPublishError(responseError(404, {})).kind).toBe("company");
    expect(toPublishError(responseError(401, {})).kind).toBe("session");
    expect(toPublishError(responseError(403, {})).kind).toBe("session");
  });

  it("usa el mensaje de servidor para 500 y para errores desconocidos", () => {
    expect(toPublishError(responseError(500, {}))).toMatchObject({
      kind: "server",
      message: "No se pudo completar la publicación. Inténtalo más tarde.",
    });
    expect(toPublishError(new Error("boom")).kind).toBe("server");
  });
});
