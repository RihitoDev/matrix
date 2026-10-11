import type { WorkExperienceItem } from "./work-experience-item.types";

export interface WorkExperienceListCardProps {
  experiences?: WorkExperienceItem[];
  isLoading?: boolean;
  isBusy?: boolean;
  onEdit?: (experience: WorkExperienceItem) => void;
  onDelete?: (experience: WorkExperienceItem) => void;
}
