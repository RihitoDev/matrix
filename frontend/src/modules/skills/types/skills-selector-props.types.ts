import type { Feedback } from "@/modules/profile/types/feedback.types";
import type { SkillItem } from "./skill-item.types";

export interface SkillsSelectorProps {
  catalogSkills?: SkillItem[];
  selectedSkills?: SkillItem[];
  onAddSkill: (skill: SkillItem) => void;
  onRemoveSkill: (skillId: string) => void;
  onCreateCustomSkill: (name: string) => void;
  onSave: () => void;
  isSaving?: boolean;
  hasLoadError?: boolean;
  onRetry?: () => void;
  feedback?: Feedback | null;
}
