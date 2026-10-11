export interface SendOptions {
  params?: Record<string, string>;
  notFoundMessage?: string;
  onUploadProgress?: (event: { loaded: number; total?: number }) => void;
}
