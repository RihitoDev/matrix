export interface CertificationUploadError {
  response?: {
    status?: unknown;
    data?: {
      data?: {
        code?: unknown;
      } | null;
    } | null;
  };
}
