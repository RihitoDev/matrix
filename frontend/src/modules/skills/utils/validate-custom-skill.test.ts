import { describe, expect, it } from "vitest";
import { SKILLS_VALIDATION_MESSAGES } from "../constants/skills.constants";
import type { SkillItem } from "../types/skill-item.types";
import { validateCustomSkill } from "./validate-custom-skill";

const EXISTING_SKILLS: SkillItem[] = [
  { id: "skill-1", name: "React" },
  { id: "skill-2", name: "TypeScript" },
];

describe("validateCustomSkill", () => {
  it("rejects an empty name", () => {
    expect(validateCustomSkill("", EXISTING_SKILLS)).toBe(SKILLS_VALIDATION_MESSAGES.emptyName);
  });

  it("rejects a name with only spaces", () => {
    expect(validateCustomSkill("   ", EXISTING_SKILLS)).toBe(SKILLS_VALIDATION_MESSAGES.emptyName);
  });

  it("rejects a name that already exists ignoring case and surrounding spaces", () => {
    expect(validateCustomSkill("  REACT ", EXISTING_SKILLS)).toBe(SKILLS_VALIDATION_MESSAGES.duplicated);
  });

  it("accepts a new name", () => {
    expect(validateCustomSkill("Docker", EXISTING_SKILLS)).toBeNull();
  });
});
