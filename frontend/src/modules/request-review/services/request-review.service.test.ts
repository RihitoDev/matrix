import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/services/api-client";
import { requestReviewService } from "./request-review.service";

const get = vi.spyOn(apiClient, "get");
const reply = (status: number, data: unknown) => get.mockResolvedValue({ status, data } as never);
const item = { id: "1", fullName: "Ana Pérez" };

describe("requestReviewService.listRequests", () => {
  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue({ status: 500, data: {} } as never);
    sessionStorage.setItem("accessToken", "token-de-prueba");
  });
  afterEach(() => sessionStorage.clear());

  it("envía el estado, la página, el límite y el token Bearer", async () => {
    reply(200, { data: { items: [item], total: 11 }, page: 2, offset: 10 });

    const result = await requestReviewService.listRequests("pending", 2, 10);

    expect(result).toEqual({ ok: true, data: { items: [item], total: 11, page: 2, offset: 10 } });
    expect(get).toHaveBeenCalledWith(
      "/access-requests",
      expect.objectContaining({ params: { status: "pending", page: 2, limit: 10 }, headers: { Authorization: "Bearer token-de-prueba" } }),
    );
  });

  it("usa la página pedida si el cuerpo no trae page ni offset, y el límite por defecto", async () => {
    reply(200, { data: { items: [], total: 0 } });

    const result = await requestReviewService.listRequests("approved", 3);

    expect(result).toEqual({ ok: true, data: { items: [], total: 0, page: 3, offset: 20 } });
  });

  it("sin token no envía la cabecera de autorización", async () => {
    sessionStorage.clear();
    reply(401, { detail: "Debes iniciar sesión para continuar" });

    await requestReviewService.listRequests("pending", 1);

    expect(get.mock.calls[0][1]?.headers).toEqual({});
  });

  it.each([
    [401, "Tu sesión expiró. Inicia sesión de nuevo."],
    [403, "No tienes permiso para ver las solicitudes."],
  ])("traduce el %d a un mensaje en español", async (status, message) => {
    reply(status, { detail: "texto del servidor" });
    expect(await requestReviewService.listRequests("pending", 1)).toEqual({ ok: false, status, message });
  });

  it("usa el detalle de los errores de dominio y un texto genérico si no hay", async () => {
    reply(409, { detail: "Conflicto" });
    expect(await requestReviewService.listRequests("pending", 1)).toMatchObject({ ok: false, status: 409, message: "Conflicto" });
    reply(500, "<html>");
    expect(await requestReviewService.listRequests("pending", 1)).toMatchObject({ ok: false, status: 500, message: "No se pudo completar la operación. Inténtalo de nuevo." });
  });

  it.each([[{}], ["texto"], [{ data: { items: "x", total: 1 } }], [{ data: { items: [], total: "1" } }]])("un 200 con cuerpo inválido %j da error", async (body) => {
    reply(200, body);
    expect(await requestReviewService.listRequests("pending", 1)).toMatchObject({ ok: false, status: 0 });
  });

  it("devuelve error de conexión si la petición falla", async () => {
    get.mockImplementation(async () => {
      throw new Error("red");
    });
    expect(await requestReviewService.listRequests("pending", 1)).toEqual({
      ok: false,
      status: 0,
      message: "No se pudo conectar con el servidor. Inténtalo de nuevo.",
    });
  });
});

describe("requestReviewService.getRequestDetail", () => {
  const detailBody = { id: "1", history: { submittedAt: null, reviewedAt: null, reviewedBy: null, rejectionReason: null } };
  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue({ status: 500, data: {} } as never);
    sessionStorage.setItem("accessToken", "token-de-prueba");
  });
  afterEach(() => sessionStorage.clear());

  it("pide el detalle con el token y acepta el cuerpo plano o envuelto", async () => {
    reply(200, detailBody);
    expect(await requestReviewService.getRequestDetail("1")).toEqual({ ok: true, data: detailBody });
    expect(get).toHaveBeenCalledWith("/access-requests/1", expect.objectContaining({ headers: { Authorization: "Bearer token-de-prueba" } }));

    reply(200, { statusCode: 200, ok: true, detail: "ok", data: detailBody });
    expect(await requestReviewService.getRequestDetail("1")).toEqual({ ok: true, data: detailBody });
  });

  it("traduce 404, 401 y 403", async () => {
    reply(404, { detail: "x" });
    expect(await requestReviewService.getRequestDetail("1")).toEqual({ ok: false, status: 404, message: "La solicitud no existe." });
    reply(401, {});
    expect(await requestReviewService.getRequestDetail("1")).toMatchObject({ status: 401, message: "Tu sesión expiró. Inicia sesión de nuevo." });
    reply(403, {});
    expect(await requestReviewService.getRequestDetail("1")).toMatchObject({ status: 403 });
  });

  it.each([["texto"], [{}], [{ id: 5, history: {} }]])("un 200 inválido %j da error", async (body) => {
    reply(200, body);
    expect(await requestReviewService.getRequestDetail("1")).toMatchObject({ ok: false, status: 0 });
  });

  it("devuelve error de conexión si falla la red", async () => {
    get.mockImplementation(async () => {
      throw new Error("red");
    });
    expect(await requestReviewService.getRequestDetail("1")).toMatchObject({ ok: false, status: 0, message: "No se pudo conectar con el servidor. Inténtalo de nuevo." });
  });
});

describe("requestReviewService.getDocumentBlob", () => {
  beforeEach(() => get.mockReset());

  it("pide los bytes como blob y los devuelve", async () => {
    const blob = new Blob(["%PDF"]);
    reply(200, blob);
    expect(await requestReviewService.getDocumentBlob("1")).toEqual({ ok: true, data: blob });
    expect(get).toHaveBeenCalledWith("/access-requests/1/document", expect.objectContaining({ responseType: "blob" }));
  });

  it("traduce 404 a 'no tiene documento' y otros errores a mensajes en español", async () => {
    reply(404, new Blob(["x"]));
    expect(await requestReviewService.getDocumentBlob("1")).toEqual({ ok: false, status: 404, message: "La solicitud no tiene un documento adjunto." });
    reply(403, new Blob(["x"]));
    expect(await requestReviewService.getDocumentBlob("1")).toMatchObject({ status: 403 });
    reply(500, new Blob(["x"]));
    expect(await requestReviewService.getDocumentBlob("1")).toMatchObject({ status: 500, message: "No se pudo completar la operación. Inténtalo de nuevo." });
  });

  it("un 200 que no es un Blob da error", async () => {
    reply(200, "texto");
    expect(await requestReviewService.getDocumentBlob("1")).toMatchObject({ ok: false, status: 0 });
  });
});

describe("requestReviewService.approveRequest", () => {
  const patch = vi.spyOn(apiClient, "patch");
  const replyPatch = (status: number, data: unknown) => patch.mockResolvedValue({ status, data } as never);
  beforeEach(() => {
    patch.mockReset();
    sessionStorage.setItem("accessToken", "token-de-prueba");
  });
  afterEach(() => sessionStorage.clear());

  it("aprueba con el token y acepta el cuerpo plano o envuelto", async () => {
    replyPatch(200, { id: "1", status: "approved", activationCodeSent: true });
    expect(await requestReviewService.approveRequest("1")).toEqual({ ok: true, data: { id: "1", status: "approved", activationCodeSent: true } });
    expect(patch).toHaveBeenCalledWith("/access-requests/1/approve", undefined, expect.objectContaining({ headers: { Authorization: "Bearer token-de-prueba" } }));

    replyPatch(200, { statusCode: 200, ok: true, detail: "ok", data: { id: "1", status: "approved", activationCodeSent: false } });
    expect(await requestReviewService.approveRequest("1")).toEqual({ ok: true, data: { id: "1", status: "approved", activationCodeSent: false } });
  });

  it("traduce 404, 409 y 403", async () => {
    replyPatch(404, {});
    expect(await requestReviewService.approveRequest("1")).toEqual({ ok: false, status: 404, message: "La solicitud no existe." });
    replyPatch(409, { detail: "La solicitud no está en revisión" });
    expect(await requestReviewService.approveRequest("1")).toEqual({ ok: false, status: 409, message: "La solicitud no está en revisión" });
    replyPatch(403, {});
    expect(await requestReviewService.approveRequest("1")).toMatchObject({ status: 403 });
  });

  it("un 200 sin estado aprobado da error y una red caída da error de conexión", async () => {
    replyPatch(200, { status: "pending" });
    expect(await requestReviewService.approveRequest("1")).toMatchObject({ ok: false, status: 0 });
    patch.mockRejectedValueOnce(new Error("red"));
    expect(await requestReviewService.approveRequest("1")).toMatchObject({ ok: false, status: 0, message: "No se pudo conectar con el servidor. Inténtalo de nuevo." });
  });
});

describe("requestReviewService.rejectRequest", () => {
  const patch = vi.spyOn(apiClient, "patch");
  const replyPatch = (status: number, data: unknown) => patch.mockResolvedValue({ status, data } as never);
  beforeEach(() => {
    patch.mockReset();
    sessionStorage.setItem("accessToken", "token-de-prueba");
  });
  afterEach(() => sessionStorage.clear());

  it("envía el motivo con el token y acepta el cuerpo plano o envuelto", async () => {
    replyPatch(200, { id: "1", status: "rejected", notificationSent: true });
    expect(await requestReviewService.rejectRequest("1", "Motivo")).toEqual({ ok: true, data: { id: "1", status: "rejected", notificationSent: true } });
    expect(patch).toHaveBeenCalledWith("/access-requests/1/reject", { reason: "Motivo" }, expect.objectContaining({ headers: { Authorization: "Bearer token-de-prueba" } }));

    replyPatch(200, { statusCode: 200, ok: true, detail: "ok", data: { id: "1", status: "rejected", notificationSent: false } });
    expect(await requestReviewService.rejectRequest("1", "Motivo")).toEqual({ ok: true, data: { id: "1", status: "rejected", notificationSent: false } });
  });

  it("muestra el mensaje en español del 400 de Zod y traduce 404, 409 y 403", async () => {
    replyPatch(400, { message: [{ message: "El motivo del rechazo es obligatorio" }], statusCode: 400 });
    expect(await requestReviewService.rejectRequest("1", "")).toEqual({ ok: false, status: 400, message: "El motivo del rechazo es obligatorio" });
    replyPatch(404, {});
    expect(await requestReviewService.rejectRequest("1", "m")).toMatchObject({ status: 404, message: "La solicitud no existe." });
    replyPatch(409, { detail: "La solicitud no está en revisión" });
    expect(await requestReviewService.rejectRequest("1", "m")).toEqual({ ok: false, status: 409, message: "La solicitud no está en revisión" });
    replyPatch(403, {});
    expect(await requestReviewService.rejectRequest("1", "m")).toMatchObject({ status: 403 });
  });

  it("también lee el mensaje de validación del formato estándar (body.errors)", async () => {
    replyPatch(400, { statusCode: 400, ok: false, detail: "Los datos de la solicitud no son válidos.", data: null, errors: [{ field: "reason", message: "El motivo del rechazo es obligatorio" }] });
    expect(await requestReviewService.rejectRequest("1", "")).toEqual({ ok: false, status: 400, message: "El motivo del rechazo es obligatorio" });
  });

  it("sin mensajes de validación usa el detalle del servidor o el texto genérico", async () => {
    replyPatch(400, { detail: "Los datos de la solicitud no son válidos.", errors: [] });
    expect(await requestReviewService.rejectRequest("1", "")).toMatchObject({ status: 400, message: "Los datos de la solicitud no son válidos." });
    replyPatch(400, { message: [], errors: "x" });
    expect(await requestReviewService.rejectRequest("1", "")).toMatchObject({ status: 400, message: "No se pudo completar la operación. Inténtalo de nuevo." });
  });

  it("un 400 sin forma de Zod usa el texto genérico; un 200 sin estado rechazado y una red caída dan error", async () => {
    replyPatch(400, "x");
    expect(await requestReviewService.rejectRequest("1", "m")).toMatchObject({ ok: false, status: 400, message: "No se pudo completar la operación. Inténtalo de nuevo." });
    replyPatch(200, { status: "approved" });
    expect(await requestReviewService.rejectRequest("1", "m")).toMatchObject({ ok: false, status: 0 });
    patch.mockRejectedValueOnce(new Error("red"));
    expect(await requestReviewService.rejectRequest("1", "m")).toMatchObject({ ok: false, status: 0, message: "No se pudo conectar con el servidor. Inténtalo de nuevo." });
  });
});
