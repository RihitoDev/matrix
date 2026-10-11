import type { PresentationValues } from "./presentation-values.types";

export interface ProfilePreviewCardProps {
  fullName: string;
  photoUrl?: string | null;
  presentation: PresentationValues;
}
