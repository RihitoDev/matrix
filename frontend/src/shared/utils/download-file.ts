import { FILE_NAME_PATTERN } from "@/shared/constants/download-file.constants";

export function getFileNameFromDisposition(disposition: string | undefined, fallbackName: string): string {
  return disposition?.match(FILE_NAME_PATTERN)?.[1] ?? fallbackName;
}

export function downloadFile(file: Blob, fileName: string): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
