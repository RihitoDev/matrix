import type { Certification } from "./certification.types";

export interface CertificationCardProps {
  certification: Certification;
  isBusy?: boolean;
  onEdit: (certification: Certification) => void;
  onDelete: (certification: Certification) => void;
  onViewDocument: (certification: Certification) => void;
}
