import { DOCUMENT_FORMAT_BY_EXTENSION } from "../constants/certification-form.constants";

export function getFileFormat(fileName: string): string {
  const extension = fileName.slice(fileName.lastIndexOf(".") + 1).toLowerCase();
  return DOCUMENT_FORMAT_BY_EXTENSION[extension] ?? extension.toUpperCase();
}
