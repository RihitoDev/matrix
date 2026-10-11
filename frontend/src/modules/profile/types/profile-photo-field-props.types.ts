export interface ProfilePhotoFieldProps {
  photoUrl?: string | null;
  previewUrl?: string | null;
  isUploading?: boolean;
  isDeleting?: boolean;
  error?: string | null;
  onSelectPhoto?: (file: File) => void;
  onConfirmPhoto?: () => void;
  onCancelPhoto?: () => void;
  onDeletePhoto?: () => void;
}
