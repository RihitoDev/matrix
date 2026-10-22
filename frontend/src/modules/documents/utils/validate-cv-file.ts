import { CV_ALLOWED_EXTENSIONS, CV_ALLOWED_TYPES } from "@/modules/profile";
import { FILE_VALIDATION_MESSAGES } from "@/modules/profile";
import { validateFile } from "@/modules/profile";

export function validateCvFile(file: File): string | null {
  return validateFile(
    file,
    CV_ALLOWED_TYPES,
    CV_ALLOWED_EXTENSIONS,
    FILE_VALIDATION_MESSAGES.invalidCvType,
  );
}
