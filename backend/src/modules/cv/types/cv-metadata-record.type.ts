export interface CvMetadataRecord {
  firstName: string;
  lastName: string;
  fileName: string | null;
  sizeBytes: number | null;
  uploadedAt: Date | null;
}
