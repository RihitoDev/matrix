import type { Certification } from "./certification.types";
import type { UploadedDocumentInfo } from "@/modules/profile";

export interface CertificationDocumentItemProps {
  certification: Certification;
  info?: UploadedDocumentInfo;
  isBusy?: boolean;
  onView: (certification: Certification) => void;
}
