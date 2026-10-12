export type CertificationSaveResult =
  | { status: "saved" }
  | { status: "failed"; fileError: string | null };
