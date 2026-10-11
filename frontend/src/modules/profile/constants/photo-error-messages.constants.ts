import { FILE_VALIDATION_MESSAGES } from "../config/file-validation-messages.config";

export const PHOTO_ERROR_MESSAGES = {
  upload: "No se pudo subir tu fotografía. Intenta de nuevo.",
  load: "No se pudo cargar tu fotografía. Intenta de nuevo.",
  delete: "No se pudo eliminar tu fotografía. Intenta de nuevo.",
};

export const PHOTO_ERROR_MESSAGES_BY_STATUS: Record<number, string> = {
  400: FILE_VALIDATION_MESSAGES.emptyFile,
  401: "Tu sesión no es válida. Inicia sesión nuevamente.",
  413: FILE_VALIDATION_MESSAGES.fileTooLarge,
  415: FILE_VALIDATION_MESSAGES.invalidPhotoType,
};
