import { MAX_FILE_SIZE_BYTES } from "../config/file-upload.config";
import { FILE_VALIDATION_MESSAGES } from "../config/file-validation-messages.config";

function hasAllowedFormat(
  file: File,
  allowedTypes: readonly string[],
  allowedExtensions: readonly string[],
): boolean {
  if (file.type) {
    return allowedTypes.includes(file.type);
  }

  const fileName = file.name.toLowerCase();
  return allowedExtensions.some((extension) => fileName.endsWith(extension));
}

export function validateFile(
  file: File,
  allowedTypes: readonly string[],
  allowedExtensions: readonly string[],
  invalidTypeMessage: string,
): string | null {
  if (!hasAllowedFormat(file, allowedTypes, allowedExtensions)) {
    return invalidTypeMessage;
  }

  if (file.size === 0) {
    return FILE_VALIDATION_MESSAGES.emptyFile;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return FILE_VALIDATION_MESSAGES.fileTooLarge;
  }

  return null;
}
