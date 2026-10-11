import type { SavedCv } from "./saved-cv.types";

export interface SavedCvCardProps {
  savedCv: SavedCv | null;
  isLoading?: boolean;
  isBusy?: boolean;
  onReplace: () => void;
  onDelete: () => void;
}
