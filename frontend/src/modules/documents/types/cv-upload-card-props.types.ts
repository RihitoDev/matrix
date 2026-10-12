export interface CvUploadCardProps {
  selectedFile: File | null;
  hasSavedCv: boolean;
  isLoading?: boolean;
  isUploading: boolean;
  isBusy: boolean;
  onSelectFile: () => void;
  onConfirmUpload: (file: File) => void;
}
