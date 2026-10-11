import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/services/api-client";
import type { AccessRequestPayload } from "../types/access-request.types";
import { accessRequestService } from "./access-request.service";

vi.mock("@/shared/services/api-client", () => ({ apiClient: { request: vi.fn() } }));

const request = vi.mocked(apiClient.request);

const payload: AccessRequestPayload = {
  firstName: "Ana",
  lastName: "Rojas",
  idCardNumber: "123",
  idCardIssuedIn: "LP",
  sisCode: "456",
  email: "ana@umss.edu.bo",
  birthDate: "2000-05-10",
  graduationYear: 2019,
  career: "Licenciatura en Ingeniería de Sistemas",
};

function reply(status: number, data: unknown) {
  request.mockResolvedValue({ status, data } as never);
}

describe("accessRequestService", () => {
  beforeEach(() => {
    request.mockReset();
  });

  it("createAccessRequest hace POST sin cabecera de autorización y devuelve { id }", async () => {
    reply(201, { id: "id-1" });

    const result = await accessRequestService.createAccessRequest(payload);

    expect(result).toEqual({ ok: true, data: { id: "id-1" } });
    const config = request.mock.calls[0][0];
    expect(config).toMatchObject({ method: "post", url: "/access-requests", data: payload });
    expect(config?.headers).toBeUndefined();
  });

  it.each([
    ["sin id", {}],
    ["con id numérico", { id: 123 }],
    ["con id vacío", { id: "" }],
    ["con id solo de espacios", { id: "   " }],
    ["con id nulo", { id: null }],
  ])("createAccessRequest con 201 %s devuelve el error con status 0", async (_name, body) => {
    reply(201, body);

    const result = await accessRequestService.createAccessRequest(payload);

    expect(result).toEqual({
      ok: false,
      status: 0,
      fieldErrors: {},
      message: "No se pudo completar la solicitud. Inténtalo de nuevo.",
    });
  });

  it("updateAccessRequest hace PATCH al id", async () => {
    reply(200, { id: "id-1" });

    const result = await accessRequestService.updateAccessRequest("id-1", payload);

    expect(result.ok).toBe(true);
    expect(request.mock.calls[0][0]).toMatchObject({ method: "patch", url: "/access-requests/id-1" });
  });

  describe("deleteAccessRequest", () => {
    it("hace DELETE al id sin cuerpo ni cabecera de autorización y devuelve ok", async () => {
      reply(200, { id: "id-1" });

      const result = await accessRequestService.deleteAccessRequest("id-1");

      expect(result).toEqual({ ok: true, data: { id: "id-1" } });
      const config = request.mock.calls[0][0];
      expect(config).toMatchObject({ method: "delete", url: "/access-requests/id-1" });
      expect(config?.data).toBeUndefined();
      expect(config?.headers).toBeUndefined();
    });

    it("devuelve el 404 con el mensaje fijo y sin campo", async () => {
      reply(404, { statusCode: 404, data: null, detail: "La solicitud de acceso no existe", ok: false });

      const result = await accessRequestService.deleteAccessRequest("id-1");

      expect(result).toEqual({ ok: false, status: 404, fieldErrors: {}, message: "La solicitud ya no existe" });
    });

    it("devuelve el detail del 409 cuando la solicitud ya fue enviada", async () => {
      const detail = "La solicitud ya fue enviada y no se puede eliminar";
      reply(409, { statusCode: 409, data: null, detail, ok: false });

      const result = await accessRequestService.deleteAccessRequest("id-1");

      expect(result).toEqual({ ok: false, status: 409, fieldErrors: {}, message: detail });
    });

    it("devuelve status 0 ante un fallo de red", async () => {
      request.mockRejectedValue(new Error("Network Error"));

      const result = await accessRequestService.deleteAccessRequest("id-1");

      expect(result).toEqual({
        ok: false,
        status: 0,
        fieldErrors: {},
        message: "No se pudo conectar con el servidor. Inténtalo de nuevo.",
      });
    });

    it("devuelve status 0 si el cuerpo no es JSON válido", async () => {
      reply(200, "<html>no es json</html>");
      expect(await accessRequestService.deleteAccessRequest("id-1")).toMatchObject({ ok: false, status: 0 });

      reply(502, "<html>Bad Gateway</html>");
      expect(await accessRequestService.deleteAccessRequest("id-1")).toMatchObject({ ok: false, status: 0 });
    });
  });

  it("normaliza el 400 de Zod a fieldErrors por campo", async () => {
    reply(400, {
      message: [
        { code: "invalid_value", values: ["a"], path: ["career"], message: "La carrera no es válida" },
        { code: "custom", path: ["graduationYear"], message: "El año de titulación no puede ser futuro" },
        { code: "custom", path: ["career"], message: "segundo mensaje ignorado" },
      ],
      error: "Bad Request",
      statusCode: 400,
    });

    const result = await accessRequestService.createAccessRequest(payload);

    expect(result).toEqual({
      ok: false,
      status: 400,
      fieldErrors: {
        career: "La carrera no es válida",
        graduationYear: "El año de titulación no puede ser futuro",
      },
      message: "Revisa los campos marcados",
    });
  });

  it("usa el mensaje de un issue sin campo como mensaje general", async () => {
    reply(400, { message: [{ code: "custom", path: [], message: "Debes enviar al menos un campo para actualizar" }], statusCode: 400 });

    const result = await accessRequestService.updateAccessRequest("id-1", payload);

    expect(result).toMatchObject({ ok: false, status: 400, fieldErrors: {}, message: "Debes enviar al menos un campo para actualizar" });
  });

  it("toma detail de los errores de dominio", async () => {
    reply(400, { statusCode: 400, data: null, detail: "La solicitud ya fue enviada", ok: false });

    const result = await accessRequestService.updateAccessRequest("id-1", payload);

    expect(result).toEqual({ ok: false, status: 400, fieldErrors: {}, message: "La solicitud ya fue enviada" });
  });

  it("mapea la coherencia del año de titulación a graduationYear", async () => {
    const detail = "El año de titulación no puede ser anterior a los 18 años de edad";
    reply(400, { statusCode: 400, data: null, detail, ok: false });

    const result = await accessRequestService.updateAccessRequest("id-1", payload);

    expect(result).toMatchObject({ ok: false, status: 400, fieldErrors: { graduationYear: detail }, message: detail });
  });

  it("mapea el 409 con un solo campo repetido", async () => {
    const detail = "El correo ya está registrado";
    reply(409, { statusCode: 409, data: null, detail, ok: false });

    const result = await accessRequestService.createAccessRequest(payload);

    expect(result).toEqual({ ok: false, status: 409, fieldErrors: { email: detail }, message: detail });
  });

  it("mapea el 409 con varios campos repetidos", async () => {
    const detail = "El correo, el carnet de identidad y el código SIS ya están registrados";
    reply(409, { statusCode: 409, data: null, detail, ok: false });

    const result = await accessRequestService.createAccessRequest(payload);

    expect(result).toEqual({
      ok: false,
      status: 409,
      fieldErrors: { email: detail, idCardNumber: detail, sisCode: detail },
      message: detail,
    });
  });

  it("mapea el 409 de carnet y código SIS sin tocar el correo", async () => {
    const detail = "El carnet de identidad y el código SIS ya están registrados";
    reply(409, { statusCode: 409, data: null, detail, ok: false });

    const result = await accessRequestService.createAccessRequest(payload);

    expect(result).toMatchObject({ fieldErrors: { idCardNumber: detail, sisCode: detail } });
    expect(result.ok === false && result.fieldErrors.email).toBeUndefined();
  });

  it("devuelve el 404 con el mensaje fijo y sin campo", async () => {
    reply(404, { statusCode: 404, data: null, detail: "Solicitud no encontrada", ok: false });

    const result = await accessRequestService.updateAccessRequest("id-1", payload);

    expect(result).toEqual({ ok: false, status: 404, fieldErrors: {}, message: "La solicitud ya no existe" });
  });

  it("devuelve status 0 ante un fallo de red", async () => {
    request.mockRejectedValue(new Error("Network Error"));

    const result = await accessRequestService.createAccessRequest(payload);

    expect(result).toEqual({
      ok: false,
      status: 0,
      fieldErrors: {},
      message: "No se pudo conectar con el servidor. Inténtalo de nuevo.",
    });
  });

  it("devuelve status 0 si el cuerpo no es JSON válido", async () => {
    reply(201, "<html>no es json</html>");
    expect(await accessRequestService.createAccessRequest(payload)).toMatchObject({ ok: false, status: 0 });

    reply(502, "<html>Bad Gateway</html>");
    expect(await accessRequestService.createAccessRequest(payload)).toMatchObject({ ok: false, status: 0 });
  });

  it("usa un mensaje genérico o el mensaje de texto de Nest en otros errores", async () => {
    reply(500, { statusCode: 500 });
    expect(await accessRequestService.createAccessRequest(payload)).toMatchObject({ ok: false, status: 500, message: "No se pudo completar la solicitud. Inténtalo de nuevo." });

    reply(400, { statusCode: 400, message: "Validation failed (uuid is expected)", error: "Bad Request" });
    expect(await accessRequestService.updateAccessRequest("x", payload)).toMatchObject({ ok: false, status: 400, message: "Validation failed (uuid is expected)" });
  });

  describe("uploadDocument", () => {
    const file = new File(["%PDF-1.4"], "titulo.pdf", { type: "application/pdf" });
    const ok = { id: "id-1", documentFileId: "file-1", documentType: "national_title" };

    it("hace POST multipart con file y documentType, sin forzar Content-Type", async () => {
      reply(201, ok);

      const result = await accessRequestService.uploadDocument("id-1", file, "national_title");

      expect(result).toEqual({ ok: true, data: ok });
      const config = request.mock.calls[0][0];
      expect(config).toMatchObject({ method: "post", url: "/access-requests/id-1/document" });
      expect(config?.headers).toBeUndefined();
      expect(config?.data).toBeInstanceOf(FormData);
      const form = config?.data as FormData;
      expect((form.get("file") as File).name).toBe("titulo.pdf");
      expect(form.get("documentType")).toBe("national_title");
    });

    it("informa el progreso como porcentaje entero", async () => {
      reply(201, ok);
      const onProgress = vi.fn();

      await accessRequestService.uploadDocument("id-1", file, "national_title", onProgress);

      const report = request.mock.calls[0][0]?.onUploadProgress as (event: { loaded: number; total?: number }) => void;
      report({ loaded: 0, total: 300 });
      report({ loaded: 100, total: 300 });
      report({ loaded: 300, total: 300 });
      expect(onProgress.mock.calls.map(([value]) => value)).toEqual([0, 33, 100]);
    });

    it("no llama al progreso si no hay total", async () => {
      reply(201, ok);
      const onProgress = vi.fn();

      await accessRequestService.uploadDocument("id-1", file, "national_title", onProgress);

      const report = request.mock.calls[0][0]?.onUploadProgress as (event: { loaded: number; total?: number }) => void;
      report({ loaded: 50 });
      expect(onProgress).not.toHaveBeenCalled();
    });

    it("funciona sin callback de progreso", async () => {
      reply(201, ok);

      await accessRequestService.uploadDocument("id-1", file, "national_title");

      const report = request.mock.calls[0][0]?.onUploadProgress as (event: { loaded: number; total?: number }) => void;
      expect(() => report({ loaded: 1, total: 2 })).not.toThrow();
    });

    it("devuelve el detail del 400 de dominio", async () => {
      const detail = "Solo se permiten archivos JPG, PNG o PDF";
      reply(400, { statusCode: 400, data: null, detail, ok: false });

      const result = await accessRequestService.uploadDocument("id-1", file, "national_title");

      expect(result).toEqual({ ok: false, status: 400, fieldErrors: {}, message: detail });
    });

    it("normaliza el 400 de Zod a fieldErrors.documentType", async () => {
      reply(400, {
        message: [{ code: "invalid_value", path: ["documentType"], message: "El tipo de documento no es válido" }],
        error: "Bad Request",
        statusCode: 400,
      });

      const result = await accessRequestService.uploadDocument("id-1", file, "national_title");

      expect(result).toEqual({
        ok: false,
        status: 400,
        fieldErrors: { documentType: "El tipo de documento no es válido" },
        message: "Revisa los campos marcados",
      });
    });

    it("el 413 usa el texto del issue y no el del servidor", async () => {
      reply(413, { statusCode: 413, data: null, detail: "El archivo no puede superar los 10 MB", ok: false });

      const result = await accessRequestService.uploadDocument("id-1", file, "national_title");

      expect(result).toEqual({ ok: false, status: 413, fieldErrors: {}, message: "El archivo supera el máximo de 10 MB." });
    });

    it("el 413 sin cuerpo JSON también usa el texto del issue", async () => {
      reply(413, "<html>Request Entity Too Large</html>");

      expect(await accessRequestService.uploadDocument("id-1", file, "national_title")).toMatchObject({
        ok: false,
        status: 413,
        message: "El archivo supera el máximo de 10 MB.",
      });
    });

    it("devuelve el 404 con el mensaje fijo", async () => {
      reply(404, { statusCode: 404, data: null, detail: "La solicitud de acceso no existe", ok: false });

      const result = await accessRequestService.uploadDocument("id-1", file, "national_title");

      expect(result).toEqual({ ok: false, status: 404, fieldErrors: {}, message: "La solicitud ya no existe" });
    });

    it("devuelve el detail del 409", async () => {
      const detail = "La solicitud ya fue enviada y no se puede modificar";
      reply(409, { statusCode: 409, data: null, detail, ok: false });

      const result = await accessRequestService.uploadDocument("id-1", file, "national_title");

      expect(result).toEqual({ ok: false, status: 409, fieldErrors: {}, message: detail });
    });

    it("devuelve status 0 ante un fallo de red", async () => {
      request.mockRejectedValue(new Error("Network Error"));

      const result = await accessRequestService.uploadDocument("id-1", file, "national_title");

      expect(result).toEqual({
        ok: false,
        status: 0,
        fieldErrors: {},
        message: "No se pudo conectar con el servidor. Inténtalo de nuevo.",
      });
    });

    it.each([
      ["sin documentFileId", { id: "id-1" }],
      ["con documentFileId nulo", { id: "id-1", documentFileId: null }],
      ["con documentFileId numérico", { id: "id-1", documentFileId: 7 }],
      ["con documentFileId vacío", { id: "id-1", documentFileId: "  " }],
    ])("un 201 %s devuelve el error con status 0", async (_name, body) => {
      reply(201, body);

      const result = await accessRequestService.uploadDocument("id-1", file, "national_title");

      expect(result).toEqual({
        ok: false,
        status: 0,
        fieldErrors: {},
        message: "No se pudo completar la solicitud. Inténtalo de nuevo.",
      });
    });
  });

  describe("removeDocument", () => {
    it("hace DELETE al documento y devuelve ok", async () => {
      reply(200, { id: "id-1", documentFileId: null });

      const result = await accessRequestService.removeDocument("id-1");

      expect(result).toEqual({ ok: true, data: { id: "id-1", documentFileId: null } });
      const config = request.mock.calls[0][0];
      expect(config).toMatchObject({ method: "delete", url: "/access-requests/id-1/document" });
      expect(config?.data).toBeUndefined();
      expect(config?.headers).toBeUndefined();
      expect(config?.onUploadProgress).toBeUndefined();
    });

    it("devuelve el 404 con el mensaje fijo", async () => {
      reply(404, { statusCode: 404, data: null, detail: "La solicitud de acceso no existe", ok: false });

      expect(await accessRequestService.removeDocument("id-1")).toEqual({
        ok: false,
        status: 404,
        fieldErrors: {},
        message: "La solicitud ya no existe",
      });
    });

    it("devuelve el detail del 409", async () => {
      const detail = "La solicitud ya fue enviada y no se puede modificar";
      reply(409, { statusCode: 409, data: null, detail, ok: false });

      expect(await accessRequestService.removeDocument("id-1")).toEqual({ ok: false, status: 409, fieldErrors: {}, message: detail });
    });

    it("devuelve status 0 ante un fallo de red", async () => {
      request.mockRejectedValue(new Error("Network Error"));

      expect(await accessRequestService.removeDocument("id-1")).toMatchObject({ ok: false, status: 0 });
    });
  });

  describe("submitAccessRequest", () => {
    const ok = { id: "id-1", requestCode: "SOL-2026-0001", status: "pending", submittedAt: "2026-10-05T23:59:34.644Z" };

    it("hace POST al envío sin cuerpo ni cabecera y devuelve la solicitud", async () => {
      reply(201, ok);

      const result = await accessRequestService.submitAccessRequest("id-1");

      expect(result).toEqual({ ok: true, data: ok });
      const config = request.mock.calls[0][0];
      expect(config).toMatchObject({ method: "post", url: "/access-requests/id-1/submit" });
      expect(config?.data).toBeUndefined();
      expect(config?.headers).toBeUndefined();
    });

    it.each([
      ["sin código", { id: "id-1", submittedAt: "2026-10-05T23:59:34.644Z" }],
      ["con código vacío", { requestCode: "  ", submittedAt: "2026-10-05T23:59:34.644Z" }],
      ["con código numérico", { requestCode: 5, submittedAt: "2026-10-05T23:59:34.644Z" }],
      ["sin fecha", { requestCode: "SOL-2026-0001" }],
      ["con fecha nula", { requestCode: "SOL-2026-0001", submittedAt: null }],
    ])("un 201 %s devuelve el error con status 0", async (_name, body) => {
      reply(201, body);

      expect(await accessRequestService.submitAccessRequest("id-1")).toEqual({
        ok: false,
        status: 0,
        fieldErrors: {},
        message: "No se pudo completar la solicitud. Inténtalo de nuevo.",
      });
    });

    it.each([
      [400, "Debes adjuntar tu documento de respaldo antes de enviar la solicitud"],
      [409, "Ya tienes una solicitud activa"],
    ])("devuelve el detail del %d", async (status, detail) => {
      reply(status, { statusCode: status, data: null, detail, ok: false });

      expect(await accessRequestService.submitAccessRequest("id-1")).toEqual({ ok: false, status, fieldErrors: {}, message: detail });
    });

    it("el 404 usa el mensaje de que la solicitud ya no existe", async () => {
      reply(404, { statusCode: 404, data: null, detail: "La solicitud de acceso no existe", ok: false });

      expect(await accessRequestService.submitAccessRequest("id-1")).toMatchObject({ status: 404, message: "La solicitud ya no existe" });
    });

    it("devuelve status 0 ante un fallo de red", async () => {
      request.mockRejectedValue(new Error("Network Error"));

      expect(await accessRequestService.submitAccessRequest("id-1")).toMatchObject({
        ok: false,
        status: 0,
        message: "No se pudo conectar con el servidor. Inténtalo de nuevo.",
      });
    });
  });

  describe("getRequestStatus", () => {
    const body = {
      requestCode: "SOL-2026-0001",
      status: "pending",
      submittedAt: "2026-10-05T23:59:34.644Z",
      reviewedAt: null,
      rejectionReason: null,
      document: { type: "national_title", size: 2048, mimeType: "application/pdf" },
    };

    it("hace GET con el correo en params (no en la URL) y devuelve la respuesta", async () => {
      reply(200, body);

      const result = await accessRequestService.getRequestStatus("SOL-2026-0001", "ana@umss.edu.bo");

      expect(result).toEqual({ ok: true, data: body });
      const config = request.mock.calls[0][0];
      expect(config).toMatchObject({
        method: "get",
        url: "/access-requests/status/SOL-2026-0001",
        params: { email: "ana@umss.edu.bo" },
      });
      expect(config?.url).not.toContain("ana@");
      expect(config?.data).toBeUndefined();
    });

    it("el 404 usa el mensaje propio de la consulta", async () => {
      reply(404, { statusCode: 404, data: null, detail: "La solicitud de acceso no existe", ok: false });

      expect(await accessRequestService.getRequestStatus("SOL-2026-0001", "a@b.co")).toEqual({
        ok: false,
        status: 404,
        fieldErrors: {},
        message: "No se encontró la solicitud",
      });
    });

    it("el 400 de Zod se resume en un mensaje general", async () => {
      reply(400, {
        message: [{ code: "invalid_type", path: ["email"], message: "El correo es obligatorio" }],
        error: "Bad Request",
        statusCode: 400,
      });

      expect(await accessRequestService.getRequestStatus("SOL-2026-0001", "")).toEqual({
        ok: false,
        status: 400,
        fieldErrors: {},
        message: "El correo es obligatorio",
      });
    });

    it("el 400 de Zod sobre el código usa su mensaje", async () => {
      reply(400, { message: [{ code: "invalid_format", path: ["code"], message: "El código de solicitud no es válido" }], statusCode: 400 });

      expect(await accessRequestService.getRequestStatus("abc", "a@b.co")).toMatchObject({ status: 400, message: "El código de solicitud no es válido" });
    });

    it("el 400 de dominio devuelve su detail", async () => {
      reply(400, { statusCode: 400, data: null, detail: "Otro problema", ok: false });

      expect(await accessRequestService.getRequestStatus("SOL-2026-0001", "a@b.co")).toMatchObject({ status: 400, message: "Otro problema" });
    });

    it("el 409 devuelve su detail", async () => {
      reply(409, { statusCode: 409, data: null, detail: "Conflicto", ok: false });

      expect(await accessRequestService.getRequestStatus("SOL-2026-0001", "a@b.co")).toMatchObject({ status: 409, message: "Conflicto" });
    });

    it("devuelve status 0 ante un fallo de red", async () => {
      request.mockRejectedValue(new Error("Network Error"));

      expect(await accessRequestService.getRequestStatus("SOL-2026-0001", "a@b.co")).toMatchObject({ ok: false, status: 0 });
    });

    it.each([
      ["sin estado", { requestCode: "SOL-2026-0001" }],
      ["sin código", { status: "pending" }],
      ["con estado numérico", { requestCode: "SOL-2026-0001", status: 1 }],
    ])("un 200 %s devuelve el error con status 0", async (_name, invalid) => {
      reply(200, invalid);

      expect(await accessRequestService.getRequestStatus("SOL-2026-0001", "a@b.co")).toMatchObject({
        ok: false,
        status: 0,
        message: "No se pudo completar la solicitud. Inténtalo de nuevo.",
      });
    });

    it("un cuerpo que no es JSON devuelve status 0", async () => {
      reply(200, "<html>no es json</html>");

      expect(await accessRequestService.getRequestStatus("SOL-2026-0001", "a@b.co")).toMatchObject({ ok: false, status: 0 });
    });
  });
});
