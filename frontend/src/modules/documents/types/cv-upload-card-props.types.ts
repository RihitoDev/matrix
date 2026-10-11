export interface CvUploadCardProps {
  selectedFile: File | null;
  isUploading: boolean;
  isBusy: boolean;
  onSelectFile: () => void;
  onConfirmUpload: (file: File) => void;
}
