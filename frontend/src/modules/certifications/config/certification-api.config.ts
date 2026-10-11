export const CERTIFICATIONS_ENDPOINT = "/certifications";

export const CERTIFICATION_DOCUMENT_FIELD_NAME = "file";

export function getCertificationDocumentEndpoint(certificationId: string): string {
  return `${CERTIFICATIONS_ENDPOINT}/${certificationId}/document`;
}
