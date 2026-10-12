import type { CertificationDocumentPreview } from "./certification-document-preview.types";

export interface CertificationDocumentViewerProps {
  preview: CertificationDocumentPreview | null;
  onClose: () => void;
}
