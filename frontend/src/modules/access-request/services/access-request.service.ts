import { apiClient } from "@/shared/services/api-client";
import type {
  AccessRequestPayload,
  ApiResult,
  CreateAccessRequestResponse,
  FieldErrors,
  RequestStatusResponse,
  SubmitRequestResponse,
  UploadDocumentResponse,
} from "../types/access-request.types";
import type { DocumentType } from "../constants/document-types.constants";
import { FILE_TOO_LARGE_MESSAGE } from "../utils/validate-document-file";
import type { SendOptions } from "../types/access-request-send-options.types";

const NETWORK_ERROR_MESSAGE = "No se pudo conectar con el servidor. Inténtalo de nuevo.";
const GENERIC_ERROR_MESSAGE = "No se pudo completar la solicitud. Inténtalo de nuevo.";
const NOT_FOUND_MESSAGE = "La solicitud ya no existe";
const STATUS_NOT_FOUND_MESSAGE = "No se encontró la solicitud";

const KNOWN_FIELDS = [
  "firstName",
  "lastName",
  "idCardNumber",
  "idCardIssuedIn",
  "sisCode",
  "email",
  "phone",
  "birthDate",
  "graduationYear",
  "career",
  "documentType",
] as const;

// Palabras con las que el backend nombra los campos repetidos en el 409
const DUPLICATE_WORDS: ReadonlyArray<[string, keyof FieldErrors]> = [
  ["correo", "email"],
  ["carnet", "idCardNumber"],
  ["código sis", "sisCode"],
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function failure(status: number, message: string, fieldErrors: FieldErrors = {}): ApiResult<never> {
  return { ok: false, status, fieldErrors, message };
}

// 400 de Zod: message es un arreglo de issues { path, message, ... }
function fromZodIssues(issues: unknown[]): ApiResult<never> {
  const fieldErrors: FieldErrors = {};
  let generalMessage: string | undefined;
  for (const issue of issues) {
    if (!isRecord(issue) || typeof issue.message !== "string") continue;
    const path = Array.isArray(issue.path) ? issue.path : [];
    const field = KNOWN_FIELDS.find((name) => name === path[0]);
    if (field) {
      fieldErrors[field] ??= issue.message;
    } else {
      generalMessage ??= issue.message;
    }
  }
  const hasFields = Object.keys(fieldErrors).length > 0;
  return failure(
    400,
    generalMessage ?? (hasFields ? "Revisa los campos marcados" : GENERIC_ERROR_MESSAGE),
    fieldErrors,
  );
}

// Errores de dominio: { statusCode, data: null, detail, ok: false }
function fromDomainError(status: number, detail: string): ApiResult<never> {
  const fieldErrors: FieldErrors = {};
  const text = detail.toLowerCase();
  if (status === 409) {
    for (const [word, field] of DUPLICATE_WORDS) {
      if (text.includes(word)) fieldErrors[field] = detail;
    }
  } else if (text.includes("año de titulación")) {
    fieldErrors.graduationYear = detail;
  }
  return failure(status, detail, fieldErrors);
}

function parseError(status: number, body: unknown, notFoundMessage = NOT_FOUND_MESSAGE): ApiResult<never> {
  if (status === 404) return failure(404, notFoundMessage);
  // Se usa el texto del issue y no el del servidor; el 413 puede venir sin cuerpo JSON (por ejemplo de un proxy)
  if (status === 413) return failure(413, FILE_TOO_LARGE_MESSAGE);
  if (!isRecord(body)) return failure(0, NETWORK_ERROR_MESSAGE);
  if (Array.isArray(body.message)) return fromZodIssues(body.message);
  if (typeof body.detail === "string") return fromDomainError(status, body.detail);
  if (typeof body.message === "string") return failure(status, body.message);
  return failure(status, GENERIC_ERROR_MESSAGE);
}

// FormData: axios arma el Content-Type multipart con su boundary; no se fuerza ninguna cabecera
async function send<T>(
  method: "get" | "post" | "patch" | "delete",
  url: string,
  payload?: AccessRequestPayload | FormData,
  options: SendOptions = {},
): Promise<ApiResult<T>> {
  try {
    // Endpoints públicos: sin token. validateStatus evita que axios lance en errores HTTP
    const response = await apiClient.request({
      method,
      url,
      data: payload,
      ...(options.params && { params: options.params }),
      ...(options.onUploadProgress && { onUploadProgress: options.onUploadProgress }),
      validateStatus: () => true,
    });
    if (response.status >= 200 && response.status < 300) {
      if (!isRecord(response.data)) return failure(0, NETWORK_ERROR_MESSAGE);
      return { ok: true, data: response.data as T };
    }
    return parseError(response.status, response.data, options.notFoundMessage);
  } catch {
    return failure(0, NETWORK_ERROR_MESSAGE);
  }
}

// Un 2xx sin un id de texto no sirve para guardar el borrador: se trata como respuesta inválida
async function createAccessRequest(payload: AccessRequestPayload): Promise<ApiResult<CreateAccessRequestResponse>> {
  const result = await send<Record<string, unknown>>("post", "/access-requests", payload);
  if (!result.ok) return result;
  const { id } = result.data;
  if (typeof id !== "string" || id.trim().length === 0) return failure(0, GENERIC_ERROR_MESSAGE);
  return { ok: true, data: { id } };
}

// Un 2xx sin documentFileId de texto no sirve para mostrar el documento: se trata como respuesta inválida
async function uploadDocument(
  id: string,
  file: File,
  documentType: DocumentType,
  onProgress?: (percent: number) => void,
): Promise<ApiResult<UploadDocumentResponse>> {
  const form = new FormData();
  form.append("file", file);
  form.append("documentType", documentType);

  const result = await send<Record<string, unknown>>("post", `/access-requests/${id}/document`, form, {
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return;
      onProgress(Math.min(100, Math.max(0, Math.round((event.loaded / event.total) * 100))));
    },
  });
  if (!result.ok) return result;
  const { documentFileId } = result.data;
  if (typeof documentFileId !== "string" || documentFileId.trim().length === 0) {
    return failure(0, GENERIC_ERROR_MESSAGE);
  }
  return { ok: true, data: { id, documentFileId, documentType } };
}

// Un 2xx sin código de solicitud ni fecha de envío de texto no sirve para mostrar la confirmación
async function submitAccessRequest(id: string): Promise<ApiResult<SubmitRequestResponse>> {
  const result = await send<Record<string, unknown>>("post", `/access-requests/${id}/submit`);
  if (!result.ok) return result;
  const { requestCode, submittedAt, status } = result.data;
  if (typeof requestCode !== "string" || requestCode.trim().length === 0 || typeof submittedAt !== "string") {
    return failure(0, GENERIC_ERROR_MESSAGE);
  }
  return { ok: true, data: { id, requestCode, status: typeof status === "string" ? status : "pending", submittedAt } };
}

// El correo viaja como parámetro de consulta (axios lo codifica). Un 400 de Zod se resume en un mensaje general
async function getRequestStatus(code: string, email: string): Promise<ApiResult<RequestStatusResponse>> {
  const result = await send<Record<string, unknown>>("get", `/access-requests/status/${code}`, undefined, {
    params: { email },
    notFoundMessage: STATUS_NOT_FOUND_MESSAGE,
  });
  if (!result.ok) {
    const [firstFieldMessage] = Object.values(result.fieldErrors);
    return result.status === 400 && firstFieldMessage
      ? failure(400, firstFieldMessage)
      : result;
  }
  const { requestCode, status } = result.data;
  if (typeof requestCode !== "string" || typeof status !== "string") return failure(0, GENERIC_ERROR_MESSAGE);
  return { ok: true, data: result.data as unknown as RequestStatusResponse };
}

export const accessRequestService = {
  createAccessRequest,
  // La respuesta del PATCH no se usa para el id: el borrador ya lo tiene
  updateAccessRequest: (id: string, payload: AccessRequestPayload) =>
    send<Partial<CreateAccessRequestResponse>>("patch", `/access-requests/${id}`, payload),
  // El backend responde 200 con { id }; el 404 llega con el mensaje fijo de "ya no existe"
  deleteAccessRequest: (id: string) =>
    send<Partial<CreateAccessRequestResponse>>("delete", `/access-requests/${id}`),
  uploadDocument,
  // El backend responde 200 con { id, documentFileId: null }, también si no había documento
  removeDocument: (id: string) =>
    send<{ id: string; documentFileId: null }>("delete", `/access-requests/${id}/document`),
  submitAccessRequest,
  getRequestStatus,
};
