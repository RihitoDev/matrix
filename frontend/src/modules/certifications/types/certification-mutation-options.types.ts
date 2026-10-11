import type { Certification } from "./certification.types";

export interface CertificationMutationOptions {
  onSuccess?: (certification: Certification) => void;
}
