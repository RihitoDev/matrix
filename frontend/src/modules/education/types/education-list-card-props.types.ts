import type { EducationItem } from "./education-item.types";

export interface EducationListCardProps {
  educations?: EducationItem[];
  isLoading?: boolean;
  error?: string | null;
  isBusy?: boolean;
  onAdd?: () => void;
  onEdit?: (education: EducationItem) => void;
  onDelete?: (education: EducationItem) => void;
}
