import type { Certification } from "./certification.types";

export interface CertificationDocumentFormProps {
  certifications?: Certification[];
  isPending?: boolean;
  onSubmit: (certificationId: string, file: File) => boolean | Promise<boolean>;
}
