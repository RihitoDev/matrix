import type { Feedback } from "@/modules/profile/types/feedback.types";
import type { SkillItem } from "./skill-item.types";

export interface UseSkillsResult {
  catalogSkills: SkillItem[];
  selectedSkills: SkillItem[];
  isLoading: boolean;
  isSaving: boolean;
  hasLoadError: boolean;
  feedback: Feedback | null;
  addSkill: (skill: SkillItem) => void;
  removeSkill: (skillId: string) => void;
  createCustomSkill: (name: string) => void;
  saveSkills: () => Promise<void>;
  reload: () => Promise<void>;
}
