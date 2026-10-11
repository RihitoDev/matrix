import { BYTES_PER_KB, BYTES_PER_MB } from "../config/file-upload.config";
import { TRAILING_ZERO_DECIMAL_PATTERN } from "../constants/file-size.constants";

function formatOneDecimal(value: number): string {
  return value.toFixed(1).replace(TRAILING_ZERO_DECIMAL_PATTERN, "");
}

export function formatFileSize(bytes: number): string {
  if (bytes < BYTES_PER_MB) {
    return `${formatOneDecimal(bytes / BYTES_PER_KB)} KB`;
  }

  return `${formatOneDecimal(bytes / BYTES_PER_MB)} MB`;
}
