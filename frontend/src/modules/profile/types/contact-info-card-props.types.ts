import type { ProfileSummary } from "./profile-summary.types";

export interface ContactInfoCardProps {
  profile: ProfileSummary;
  photoUrl?: string | null;
}
