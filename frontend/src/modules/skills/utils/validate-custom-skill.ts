import { SKILLS_VALIDATION_MESSAGES } from "../constants/skills.constants";
import type { SkillItem } from "../types/skill-item.types";

function normalizeSkillName(name: string): string {
  return (name ?? "").trim().toLowerCase();
}

export function validateCustomSkill(name: string, existingSkills: SkillItem[]): string | null {
  const normalizedName = normalizeSkillName(name);

  if (!normalizedName) {
    return SKILLS_VALIDATION_MESSAGES.emptyName;
  }

  const isDuplicated = (existingSkills ?? []).some(
    (skill) => normalizeSkillName(skill?.name ?? "") === normalizedName,
  );

  return isDuplicated ? SKILLS_VALIDATION_MESSAGES.duplicated : null;
}
