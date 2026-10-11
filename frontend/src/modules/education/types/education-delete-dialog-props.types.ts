import type { Feedback } from "@/modules/profile/types/feedback.types";

export interface EducationDeleteDialogProps {
  isOpen: boolean;
  degree: string;
  isDeleting: boolean;
  feedback: Feedback | null;
  onConfirm: () => void;
  onCancel: () => void;
}
