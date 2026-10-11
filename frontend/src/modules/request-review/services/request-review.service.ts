import { apiClient } from "@/shared/services/api-client";
import { REVIEW_PAGE_SIZE } from "../constants/request-review.constants";
import type { InboxFilters } from "../types/inbox-filters.types";
import type { InboxSummary } from "../types/inbox-summary.types";
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
  const fieldMessage = isRecord(body) && Array.isArray(body.errors) && isRecord(body.errors[0]) ? body.errors[0].message : undefined;
  if (typeof fieldMessage === "string") return { ok: false, status, message: fieldMessage };
  if (isRecord(body) && typeof body.detail === "string") return { ok: false, status, message: body.detail };
  return { ok: false, status, message: GENERIC_ERROR_MESSAGE };
}

export function authHeaders(): Record<string, string> {
  const token = getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function listRequests(
  status: ReviewStatus,
  page: number,
  limit: number = REVIEW_PAGE_SIZE,
  filters: InboxFilters = {},
): Promise<ReviewApiResult<ReviewListResult>> {
  try {
    const { search, career, period } = filters;
    const response = await apiClient.get("/access-requests", {
      params: {
        status,
        page,
        limit,
        ...(search && { search }),
        ...(career && { career }),
        ...(period && period !== "all" && { period }),
      },
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

const SUMMARY_NUMBER_KEYS = [
  "pendingCount",
  "pendingOver24hCount",
  "decidedTodayCount",
  "approvedTodayCount",
  "rejectedTodayCount",
  "reviewTimeGoalHours",
  "rejectedThisMonthCount",
] as const;

async function getSummary(): Promise<ReviewApiResult<InboxSummary>> {
  try {
    const response = await apiClient.get("/access-requests/summary", { headers: authHeaders(), validateStatus: () => true });
    if (response.status < 200 || response.status >= 300) return failureOf(response.status, response.data);

    const body: unknown = response.data;
    const payload = isRecord(body) && isRecord(body.data) && "pendingCount" in body.data ? body.data : body;
    const average = isRecord(payload) ? payload.averageReviewHours : undefined;
    const reason = isRecord(payload) ? payload.topRejectionReason : undefined;
    if (
      !isRecord(payload) ||
      SUMMARY_NUMBER_KEYS.some((key) => typeof payload[key] !== "number") ||
      (average !== null && typeof average !== "number")
    ) {
      return { ok: false, status: 0, message: GENERIC_ERROR_MESSAGE };
    }
    return {
      ok: true,
      data: { ...(payload as unknown as InboxSummary), averageReviewHours: average, topRejectionReason: typeof reason === "string" ? reason : null },
    };
  } catch {
    return { ok: false, status: 0, message: NETWORK_ERROR_MESSAGE };
  }
}

const NOT_FOUND_MESSAGE = "La solicitud no existe.";
const NO_DOCUMENT_MESSAGE = "La solicitud no tiene un documento adjunto.";

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

export const requestReviewService = { listRequests, getSummary, getRequestDetail, getDocumentBlob, approveRequest, rejectRequest };
