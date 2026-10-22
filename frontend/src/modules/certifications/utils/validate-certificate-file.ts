import {
  CERTIFICATE_ALLOWED_EXTENSIONS,
  CERTIFICATE_ALLOWED_TYPES,
} from "@/modules/profile";
import { FILE_VALIDATION_MESSAGES } from "@/modules/profile";
import { validateFile } from "@/modules/profile";

export function validateCertificateFile(file: File): string | null {
  return validateFile(
    file,
    CERTIFICATE_ALLOWED_TYPES,
    CERTIFICATE_ALLOWED_EXTENSIONS,
    FILE_VALIDATION_MESSAGES.invalidCertificateType,
  );
}
