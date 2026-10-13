export interface CertificationDocumentFieldProps {
  id?: string;
  selectedFile: File | null;
  currentDocumentName?: string;
  isRemovalPending?: boolean;
  isRequired?: boolean;
  error?: string;
  disabled?: boolean;
  isUploading?: boolean;
  isReading?: boolean;
  onSelectFile: (file: File) => void;
  onClearFile: () => void;
  onRemoveCurrent?: () => void;
}
