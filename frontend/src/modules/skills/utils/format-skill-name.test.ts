import { describe, expect, it } from "vitest";
import { formatSkillName } from "./format-skill-name";

describe("formatSkillName", () => {
  it("removes spaces at the start, at the end, and between words", () => {
    expect(formatSkillName("   Spring    Boot  ")).toBe("Spring Boot");
  });

  it("keeps the name as typed", () => {
    expect(formatSkillName("react native")).toBe("react native");
    expect(formatSkillName("JavaScript")).toBe("JavaScript");
  });

  it("returns an empty string for blank input", () => {
    expect(formatSkillName("    ")).toBe("");
  });
});
