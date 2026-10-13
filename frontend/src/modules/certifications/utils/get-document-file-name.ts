import { DOCUMENT_EXTENSION_BY_MIME_TYPE } from "../constants/certification-form.constants";

export function getDocumentFileName(
  certificationName: string,
  mimeType: string,
  knownFileName?: string,
): string {
  if (knownFileName) {
    return knownFileName;
  }

  const extension = DOCUMENT_EXTENSION_BY_MIME_TYPE[mimeType];
  return extension ? `${certificationName}.${extension}` : certificationName;
}
