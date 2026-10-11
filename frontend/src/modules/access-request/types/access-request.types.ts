import type { Career } from "../constants/careers.constants";
import type { DocumentType } from "../constants/document-types.constants";
import type { IdCardIssuedIn } from "../constants/id-card-issued-in.constants";

// Valores del formulario del paso 1: todo llega como texto desde los controles
export interface PersonalDataValues {
  firstName: string;
  lastName: string;
  idCardNumber: string;
  idCardIssuedIn: string;
  sisCode: string;
  email: string;
  phone: string;
  birthDate: string;
  graduationYear: string;
  career: string;
}

export type PersonalDataFieldName = keyof PersonalDataValues;

// documentType lo informa el 400 de Zod al subir el documento
export type FieldErrors = Partial<Record<PersonalDataFieldName | "documentType", string>>;

// Cuerpo que acepta el backend (POST y PATCH)
export interface AccessRequestPayload {
  firstName: string;
  lastName: string;
  idCardNumber: string;
  idCardIssuedIn: IdCardIssuedIn;
  sisCode: string;
  email: string;
  phone?: string | null;
  birthDate: string;
  graduationYear: number;
  career: Career;
}

export interface CreateAccessRequestResponse {
  id: string;
}

// Respuesta del POST del documento; documentFileId nunca es nulo al subir
export interface UploadDocumentResponse {
  id: string;
  documentFileId: string;
  documentType: DocumentType;
}

// Respuesta del POST de envío: el borrador pasa a pending con su código de solicitud
export interface SubmitRequestResponse {
  id: string;
  requestCode: string;
  status: string;
  submittedAt: string;
}

// Respuesta de la consulta de estado; no incluye datos personales
export interface RequestStatusResponse {
  requestCode: string;
  status: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  document: { type: DocumentType; size: number; mimeType: string } | null;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; fieldErrors: FieldErrors; message: string };
