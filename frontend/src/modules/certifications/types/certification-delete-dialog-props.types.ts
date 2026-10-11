import type { Certification } from "./certification.types";

export interface CertificationDeleteDialogProps {
  certification: Certification | null;
  isDeleting?: boolean;
  onConfirm: (certification: Certification) => void;
  onCancel: () => void;
}
