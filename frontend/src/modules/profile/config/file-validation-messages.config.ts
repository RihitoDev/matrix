import { MAX_FILE_SIZE_MB } from "./file-upload.config";

export const FILE_VALIDATION_MESSAGES = {
  invalidCvType: "El CV debe estar en formato PDF.",
  invalidCertificateType: "El archivo debe ser PDF, PNG o JPG.",
  invalidPhotoType: "La fotografía debe estar en formato JPG o PNG.",
  emptyFile: "El archivo está vacío. Selecciona otro archivo.",
  fileTooLarge: `El archivo supera el límite de ${MAX_FILE_SIZE_MB} MB.`,
};
