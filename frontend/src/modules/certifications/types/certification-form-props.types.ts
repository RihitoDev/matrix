import type { CertificationDocumentChange } from "./certification-document-change.types";
import type { CreateCertificationDto } from "./create-certification-dto.types";

export interface CertificationFormProps {
  initialData?: CreateCertificationDto;
  currentDocumentName?: string;
  onSubmit: (
    values: CreateCertificationDto,
    documentChange: CertificationDocumentChange,
  ) => Promise<string | null>;
  onCancel: () => void;
}
