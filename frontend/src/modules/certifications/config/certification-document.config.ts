import { CERTIFICATE_ALLOWED_EXTENSIONS } from "@/modules/profile/config/file-upload.config";

export const CERTIFICATE_FILE_ACCEPT = CERTIFICATE_ALLOWED_EXTENSIONS.join(",");

export const DOCUMENT_URL_LIFETIME_MS = 60_000;

export const CERTIFICATION_DOCUMENT_MESSAGES = {
  uploadSuccess: "Documento adjuntado correctamente.",
  uploadError: "No se pudo adjuntar el documento. Inténtalo de nuevo.",
  removeSuccess: "Documento quitado correctamente.",
  removeError: "No se pudo quitar el documento. Inténtalo de nuevo.",
  openError: "No se pudo abrir el documento. Inténtalo de nuevo.",
  notFound: "Esta certificación no tiene un documento adjunto.",
};
