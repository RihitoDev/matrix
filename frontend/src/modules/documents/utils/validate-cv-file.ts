import { CV_ALLOWED_EXTENSIONS, CV_ALLOWED_TYPES } from "@/modules/profile/config/file-upload.config";
import { FILE_VALIDATION_MESSAGES } from "@/modules/profile/config/file-validation-messages.config";
import { validateFile } from "@/modules/profile/utils/validate-file";

export function validateCvFile(file: File): string | null {
  return validateFile(
    file,
    CV_ALLOWED_TYPES,
    CV_ALLOWED_EXTENSIONS,
    FILE_VALIDATION_MESSAGES.invalidCvType,
  );
}
