import { Button } from "@/components/ui/button";
import type { ProfilePhotoFeedbackProps } from "../types/profile-photo-feedback-props.types";
import { FeedbackMessage } from "./feedback-message";

export function ProfilePhotoFeedback({ error, isLoading, isUploading, onRetry }: ProfilePhotoFeedbackProps) {
  if (isLoading) {
    return <p role="status" className="text-sm text-text-secondary">Cargando fotografía...</p>;
  }

  if (!error) return null;

  return (
    <div className="flex flex-col items-start gap-2">
      <FeedbackMessage feedback={{ type: "error", message: error }} />
      <Button type="button" variant="outline" disabled={isUploading} onClick={onRetry}>
        Reintentar cargar fotografía
      </Button>
    </div>
  );
}
