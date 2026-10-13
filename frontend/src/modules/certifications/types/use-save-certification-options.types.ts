import type { CertificationDocumentChange } from "./certification-document-change.types";
import type { CertificationDocumentResult } from "./certification-document-result.types";

export interface UseSaveCertificationOptions {
  applyDocumentChange: (
    certificationId: string,
    change: CertificationDocumentChange,
  ) => Promise<CertificationDocumentResult>;
  onPersisted: () => void;
}
