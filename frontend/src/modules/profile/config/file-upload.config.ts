export const BYTES_PER_KB = 1024;

export const BYTES_PER_MB = 1024 * BYTES_PER_KB;

export const MAX_FILE_SIZE_MB = 5;

export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * BYTES_PER_MB;

export const CV_ALLOWED_TYPES = ["application/pdf"];

export const CV_ALLOWED_EXTENSIONS = [".pdf"];

export const PHOTO_ALLOWED_TYPES = ["image/png", "image/jpeg"];

export const PHOTO_ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg"];

export const PHOTO_ACCEPT = PHOTO_ALLOWED_EXTENSIONS.join(",");

export const CERTIFICATE_ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];

export const CERTIFICATE_ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];
