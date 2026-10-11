import { PHOTO_ALLOWED_EXTENSIONS, PHOTO_ALLOWED_TYPES } from "../config/file-upload.config";
import { FILE_VALIDATION_MESSAGES } from "../config/file-validation-messages.config";
import { validateFile } from "./validate-file";

export function validatePhotoFile(file: File): string | null {
  return validateFile(
    file,
    PHOTO_ALLOWED_TYPES,
    PHOTO_ALLOWED_EXTENSIONS,
    FILE_VALIDATION_MESSAGES.invalidPhotoType,
  );
}
