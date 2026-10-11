import type { Certification } from "./certification.types";
import type { UploadedDocumentInfo } from "@/modules/profile/types/uploaded-document-info.types";

export interface CertificationDocumentItemProps {
  certification: Certification;
  info?: UploadedDocumentInfo;
  isBusy?: boolean;
  onView: (certification: Certification) => void;
  onReplace: (certification: Certification) => void;
  onRemove: (certification: Certification) => void;
}
