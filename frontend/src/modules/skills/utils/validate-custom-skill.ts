import {
  SKILL_NAME_ALLOWED_CHARACTERS_REGEX,
  SKILL_NAME_LETTER_REGEX,
  SKILL_NAME_MAX_LENGTH,
  SKILL_NAME_REPEATED_CHARACTER_REGEX,
  SKILLS_VALIDATION_MESSAGES,
} from "../constants/skills.constants";
import type { SkillItem } from "../types/skill-item.types";

function normalizeSkillName(name: string): string {
  return (name ?? "").trim().toLowerCase();
}

export function validateCustomSkill(name: string, existingSkills: SkillItem[]): string | null {
  const normalizedName = normalizeSkillName(name);

  if (!normalizedName) {
    return SKILLS_VALIDATION_MESSAGES.emptyName;
  }

  if (normalizedName.length > SKILL_NAME_MAX_LENGTH) {
    return SKILLS_VALIDATION_MESSAGES.tooLong;
  }

  if (!SKILL_NAME_ALLOWED_CHARACTERS_REGEX.test(normalizedName)) {
    return SKILLS_VALIDATION_MESSAGES.invalidCharacters;
  }

  if (!SKILL_NAME_LETTER_REGEX.test(normalizedName)) {
    return SKILLS_VALIDATION_MESSAGES.missingLetter;
  }

  if (SKILL_NAME_REPEATED_CHARACTER_REGEX.test(normalizedName)) {
    return SKILLS_VALIDATION_MESSAGES.repeatedCharacters;
  }

  const isDuplicated = (existingSkills ?? []).some(
    (skill) => normalizeSkillName(skill?.name ?? "") === normalizedName,
  );

  return isDuplicated ? SKILLS_VALIDATION_MESSAGES.duplicated : null;
}
