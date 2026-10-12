import type { ReactNode } from "react";
import type { Certification } from "./certification.types";
import type { UploadedDocumentInfo } from "@/modules/profile/types/uploaded-document-info.types";

export interface CertificationDocumentsPanelProps {
  certifications?: Certification[];
  uploadedInfo?: Record<string, UploadedDocumentInfo>;
  isBusy?: boolean;
  form?: ReactNode;
  onView: (certification: Certification) => void;
}
