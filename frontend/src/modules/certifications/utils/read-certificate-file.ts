import { CERTIFICATION_DOCUMENT_MESSAGES } from "../config/certification-document.config";
import { validateCertificateFile } from "./validate-certificate-file";

export async function readCertificateFile(file: File): Promise<string | null> {
  const validationError = validateCertificateFile(file);
  if (validationError) {
    return validationError;
  }

  try {
    await file.arrayBuffer();
    return null;
  } catch {
    return CERTIFICATION_DOCUMENT_MESSAGES.readError;
  }
}
