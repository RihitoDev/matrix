import { CV_FILE_TYPE_LABEL } from "../constants/cv-upload.constants";
import type { CvResponse } from "../types/cv-response.types";
import type { SavedCv } from "../types/saved-cv.types";

export function toSavedCv(response: CvResponse): SavedCv {
  return {
    fileName: response.fileName,
    fileType: CV_FILE_TYPE_LABEL,
    sizeInBytes: response.sizeInBytes,
    updatedAt: new Date(response.updatedAt),
  };
}
