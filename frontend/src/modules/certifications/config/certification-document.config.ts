import { CERTIFICATE_ALLOWED_EXTENSIONS } from "@/modules/profile/config/file-upload.config";

export const CERTIFICATE_FILE_ACCEPT = CERTIFICATE_ALLOWED_EXTENSIONS.join(",");

export const CERTIFICATION_DOCUMENT_MESSAGES = {
  uploadSuccess: "Documento adjuntado correctamente.",
  uploadError: "No se pudo adjuntar el documento. Inténtalo de nuevo.",
  corruptedFile: "El archivo adjunto está dañado o no es válido",
  removeSuccess: "Documento quitado correctamente.",
  removeError: "No se pudo quitar el documento. Inténtalo de nuevo.",
  openError: "No se pudo abrir el documento. Inténtalo de nuevo.",
  notFound: "Esta certificación no tiene un documento adjunto.",
  readError: "No se pudo leer el archivo seleccionado. Inténtalo de nuevo.",
  downloadError: "No se pudo descargar el documento. Inténtalo de nuevo.",
  previewUnavailable: "No hay vista previa disponible para este tipo de archivo.",
};
