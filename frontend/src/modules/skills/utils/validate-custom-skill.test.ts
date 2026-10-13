import { describe, expect, it } from "vitest";
import { SKILL_NAME_MAX_LENGTH, SKILLS_VALIDATION_MESSAGES } from "../constants/skills.constants";
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

  it("rejects a name longer than the maximum length", () => {
    expect(validateCustomSkill("a".repeat(SKILL_NAME_MAX_LENGTH + 1), EXISTING_SKILLS)).toBe(
      SKILLS_VALIDATION_MESSAGES.tooLong,
    );
  });

  it("accepts a name with the maximum length ignoring surrounding spaces", () => {
    expect(validateCustomSkill(`  ${"ab".repeat(SKILL_NAME_MAX_LENGTH / 2)}  `, EXISTING_SKILLS)).toBeNull();
  });

  it.each(["SJCKENN;ONCM;SNV", "Docker!", "Node*js"])("rejects %s because of invalid characters", (name) => {
    expect(validateCustomSkill(name, EXISTING_SKILLS)).toBe(SKILLS_VALIDATION_MESSAGES.invalidCharacters);
  });

  it.each(["9999999", "++--", "2024"])("rejects %s because it has no letters", (name) => {
    expect(validateCustomSkill(name, EXISTING_SKILLS)).toBe(SKILLS_VALIDATION_MESSAGES.missingLetter);
  });

  it.each(["SSSSSSSS", "dddd", "Kotlinnnn", "sSsS"])(
    "rejects %s because it repeats the same character more than 3 times",
    (name) => {
      expect(validateCustomSkill(name, EXISTING_SKILLS)).toBe(SKILLS_VALIDATION_MESSAGES.repeatedCharacters);
    },
  );

  it.each(["C++", "C#", ".NET", "Node.js", "CI/CD", "Diseño UX", "Next.js 15", "R&D (Investigación)"])(
    "accepts the real skill name %s",
    (name) => {
      expect(validateCustomSkill(name, EXISTING_SKILLS)).toBeNull();
    },
  );

  it("rejects a name that already exists ignoring case and surrounding spaces", () => {
    expect(validateCustomSkill("  REACT ", EXISTING_SKILLS)).toBe(SKILLS_VALIDATION_MESSAGES.duplicated);
  });

  it("accepts a new name", () => {
    expect(validateCustomSkill("Docker", EXISTING_SKILLS)).toBeNull();
  });
});
