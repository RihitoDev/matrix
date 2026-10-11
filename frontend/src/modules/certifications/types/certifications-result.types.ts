import type { Certification } from "./certification.types";

export type CertificationsResult =
  | { certifications: Certification[]; error: null }
  | { certifications: null; error: string };
