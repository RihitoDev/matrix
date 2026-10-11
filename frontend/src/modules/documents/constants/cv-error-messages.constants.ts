import { FILE_VALIDATION_MESSAGES } from "@/modules/profile/config/file-validation-messages.config";

export const CV_ERROR_MESSAGES = {
  load: "No se pudo cargar tu CV. Intenta de nuevo más tarde.",
  upload: "No se pudo subir tu CV. Intenta de nuevo.",
  delete: "No se pudo eliminar tu CV. Intenta de nuevo.",
};

export const CV_ERROR_MESSAGES_BY_STATUS: Record<number, string> = {
  400: FILE_VALIDATION_MESSAGES.emptyFile,
  401: "Tu sesión no es válida. Inicia sesión nuevamente.",
  404: "No encontramos tu CV. Recarga la página.",
  413: FILE_VALIDATION_MESSAGES.fileTooLarge,
  415: FILE_VALIDATION_MESSAGES.invalidCvType,
  422: "El archivo está dañado o incompleto. Selecciona otro PDF.",
};

export const CV_FILE_REJECTION_STATUSES: readonly number[] = [400, 413, 415, 422];
