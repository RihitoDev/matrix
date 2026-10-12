export interface CvErrorResponse {
  response?: {
    status?: unknown;
    data?: {
      data?: {
        code?: unknown;
      } | null;
    } | null;
  };
}
