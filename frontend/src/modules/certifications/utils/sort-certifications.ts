import type { Certification } from "../types/certification.types";

export function sortCertifications(certifications: Certification[]): Certification[] {
  return [...certifications].sort((first, second) =>
    second.issueDate.localeCompare(first.issueDate),
  );
}
