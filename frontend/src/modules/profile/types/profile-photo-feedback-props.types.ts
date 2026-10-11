export interface ProfilePhotoFeedbackProps {
  error: string | null;
  isLoading: boolean;
  isUploading?: boolean;
  onRetry: () => void;
}
