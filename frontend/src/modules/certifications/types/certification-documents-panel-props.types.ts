import type { Certification } from "./certification.types";
import type { UploadedDocumentInfo } from "@/modules/profile/types/uploaded-document-info.types";

export interface CertificationDocumentsPanelProps {
  certifications?: Certification[];
  uploadedInfo?: Record<string, UploadedDocumentInfo>;
  isBusy?: boolean;
  onUpload: (certification: Certification, file: File) => boolean | Promise<boolean>;
  onRemove: (certification: Certification) => boolean | Promise<boolean>;
  onView: (certification: Certification) => void;
  onInvalidFile: (message: string) => void;
}
