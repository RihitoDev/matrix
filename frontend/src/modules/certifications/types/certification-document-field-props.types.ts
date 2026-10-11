export interface CertificationDocumentFieldProps {
  id?: string;
  selectedFile: File | null;
  error?: string;
  disabled?: boolean;
  isUploading?: boolean;
  onSelectFile: (file: File) => void;
  onClearFile: () => void;
}
