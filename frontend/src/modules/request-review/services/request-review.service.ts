import { apiClient } from "@/shared/services/api-client";
import { REVIEW_PAGE_SIZE } from "../constants/request-review.constants";
import type { ApproveResult, RejectResult, ReviewApiResult, ReviewDetail, ReviewListResult, ReviewStatus } from "../types/request-review.types";
import { getSessionToken } from "../utils/session";

const NETWORK_ERROR_MESSAGE = "No se pudo conectar con el servidor. Inténtalo de nuevo.";
const GENERIC_ERROR_MESSAGE = "No se pudo completar la operación. Inténtalo de nuevo.";
const SESSION_EXPIRED_MESSAGE = "Tu sesión expiró. Inicia sesión de nuevo.";
const FORBIDDEN_MESSAGE = "No tienes permiso para ver las solicitudes.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function failureOf(status: number, body: unknown): ReviewApiResult<never> {
  if (status === 401) return { ok: false, status, message: SESSION_EXPIRED_MESSAGE };
  if (status === 403) return { ok: false, status, message: FORBIDDEN_MESSAGE };
  if (isRecord(body) && typeof body.detail === "string") return { ok: false, status, message: body.detail };
  return { ok: false, status, message: GENERIC_ERROR_MESSAGE };
}

export function authHeaders(): Record<string, string> {
  const token = getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Lista { data: { items, total }, page, offset }; el cuerpo puede venir envuelto en el formato estándar o no
async function listRequests(
  status: ReviewStatus,
  page: number,
  limit: number = REVIEW_PAGE_SIZE,
): Promise<ReviewApiResult<ReviewListResult>> {
  try {
    const response = await apiClient.get("/access-requests", {
      params: { status, page, limit },
      headers: authHeaders(),
      validateStatus: () => true,
    });
    if (response.status < 200 || response.status >= 300) return failureOf(response.status, response.data);

    const body: unknown = response.data;
    const payload = isRecord(body) && isRecord(body.data) ? body.data : null;
    const items = payload && Array.isArray(payload.items) ? payload.items : null;
    if (!isRecord(body) || !payload || !items || typeof payload.total !== "number") {
      return { ok: false, status: 0, message: GENERIC_ERROR_MESSAGE };
    }
    return {
      ok: true,
      data: {
        items: items as ReviewListResult["items"],
        total: payload.total,
        page: typeof body.page === "number" ? body.page : page,
        offset: typeof body.offset === "number" ? body.offset : (page - 1) * limit,
      },
    };
  } catch {
    return { ok: false, status: 0, message: NETWORK_ERROR_MESSAGE };
  }
}

const NOT_FOUND_MESSAGE = "La solicitud no existe.";
const NO_DOCUMENT_MESSAGE = "La solicitud no tiene un documento adjunto.";

// Abrir el detalle pasa una solicitud pendiente a en revisión (lo hace el backend)
async function getRequestDetail(id: string): Promise<ReviewApiResult<ReviewDetail>> {
  try {
    const response = await apiClient.get(`/access-requests/${id}`, { headers: authHeaders(), validateStatus: () => true });
    if (response.status === 404) return { ok: false, status: 404, message: NOT_FOUND_MESSAGE };
    if (response.status < 200 || response.status >= 300) return failureOf(response.status, response.data);

    const body: unknown = response.data;
    const detail = isRecord(body) && isRecord(body.data) && "history" in body.data ? body.data : body;
    if (!isRecord(detail) || typeof detail.id !== "string" || !isRecord(detail.history)) {
      return { ok: false, status: 0, message: GENERIC_ERROR_MESSAGE };
    }
    return { ok: true, data: detail as unknown as ReviewDetail };
  } catch {
    return { ok: false, status: 0, message: NETWORK_ERROR_MESSAGE };
  }
}

// El dictamen solo se puede emitir desde en revisión: el backend responde 409 si ya cambió de estado
async function approveRequest(id: string): Promise<ReviewApiResult<ApproveResult>> {
  try {
    const response = await apiClient.patch(`/access-requests/${id}/approve`, undefined, {
      headers: authHeaders(),
      validateStatus: () => true,
    });
    if (response.status === 404) return { ok: false, status: 404, message: NOT_FOUND_MESSAGE };
    if (response.status < 200 || response.status >= 300) return failureOf(response.status, response.data);

    const body: unknown = response.data;
    const result = isRecord(body) && isRecord(body.data) && "status" in body.data ? body.data : body;
    if (!isRecord(result) || result.status !== "approved") return { ok: false, status: 0, message: GENERIC_ERROR_MESSAGE };
    return {
      ok: true,
      data: { id, status: "approved", activationCodeSent: result.activationCodeSent === true },
    };
  } catch {
    return { ok: false, status: 0, message: NETWORK_ERROR_MESSAGE };
  }
}

// El motivo es obligatorio; el backend responde 400 en español si falta y 409 si la solicitud ya no está en revisión
async function rejectRequest(id: string, reason: string): Promise<ReviewApiResult<RejectResult>> {
  try {
    const response = await apiClient.patch(
      `/access-requests/${id}/reject`,
      { reason },
      { headers: authHeaders(), validateStatus: () => true },
    );
    if (response.status === 404) return { ok: false, status: 404, message: NOT_FOUND_MESSAGE };
    if (response.status < 200 || response.status >= 300) {
      const body: unknown = response.data;
      // Zod llega como body.message [{ path, message }] (Nest) o como body.errors [{ field, message }] (formato estándar)
      const issues = isRecord(body) ? (Array.isArray(body.message) ? body.message : Array.isArray(body.errors) ? body.errors : []) : [];
      const first = issues[0];
      if (response.status === 400 && isRecord(first) && typeof first.message === "string") {
        return { ok: false, status: 400, message: first.message };
      }
      return failureOf(response.status, body);
    }

    const body: unknown = response.data;
    const result = isRecord(body) && isRecord(body.data) && "status" in body.data ? body.data : body;
    if (!isRecord(result) || result.status !== "rejected") return { ok: false, status: 0, message: GENERIC_ERROR_MESSAGE };
    return { ok: true, data: { id, status: "rejected", notificationSent: result.notificationSent === true } };
  } catch {
    return { ok: false, status: 0, message: NETWORK_ERROR_MESSAGE };
  }
}

// Los bytes se piden con el token y se devuelven como Blob para mostrarlos sin exponer el token en la URL
async function getDocumentBlob(id: string): Promise<ReviewApiResult<Blob>> {
  try {
    const response = await apiClient.get(`/access-requests/${id}/document`, {
      headers: authHeaders(),
      responseType: "blob",
      validateStatus: () => true,
    });
    if (response.status === 404) return { ok: false, status: 404, message: NO_DOCUMENT_MESSAGE };
    if (response.status < 200 || response.status >= 300) return failureOf(response.status, null);
    if (!(response.data instanceof Blob)) return { ok: false, status: 0, message: GENERIC_ERROR_MESSAGE };
    return { ok: true, data: response.data };
  } catch {
    return { ok: false, status: 0, message: NETWORK_ERROR_MESSAGE };
  }
}

export const requestReviewService = { listRequests, getRequestDetail, getDocumentBlob, approveRequest, rejectRequest };
