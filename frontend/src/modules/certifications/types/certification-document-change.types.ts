export type CertificationDocumentChange =
  | { type: "keep" }
  | { type: "replace"; file: File }
  | { type: "remove" };
