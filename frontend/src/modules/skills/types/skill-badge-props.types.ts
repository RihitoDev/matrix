import type { SkillItem } from "./skill-item.types";

export interface SkillBadgeProps {
  skill: SkillItem;
  onRemove: (skillId: string) => void;
  disabled?: boolean;
}
