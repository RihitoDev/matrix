export interface MentorDirectoryItem {
  id: string;
  fullName: string;
  headline: string | null;
  technicalAreas: string[];
  photoUrl: string | null;
  education: { degree: string; institution: string } | null;
  isAvailable: boolean;
  orientationTypes: string[];
}
