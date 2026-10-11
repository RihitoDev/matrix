import { describe, expect, it } from "vitest";
import { WORK_EXPERIENCE_VALIDATION_MESSAGES } from "../constants/work-experience-validation.constants";
import type { WorkExperienceFormValues } from "../types/work-experience-form-values.types";
import { validateWorkExperience } from "./validate-work-experience";

const VALID_VALUES: WorkExperienceFormValues = {
  companyName: "Synapse Labs",
  position: "Desarrolladora web",
  startDate: "2024-07-01",
  endDate: "2024-12-31",
  isCurrent: false,
  description: "",
};

describe("validateWorkExperience", () => {
  it("accepts a complete past job", () => {
    expect(validateWorkExperience(VALID_VALUES)).toEqual({});
  });

  it("accepts a current job without end date", () => {
    expect(validateWorkExperience({ ...VALID_VALUES, endDate: "", isCurrent: true })).toEqual({});
  });

  it("marks the empty required fields", () => {
    expect(
      validateWorkExperience({
        ...VALID_VALUES,
        companyName: "   ",
        position: "",
        startDate: "",
        endDate: "",
      }),
    ).toEqual({
      companyName: WORK_EXPERIENCE_VALIDATION_MESSAGES.required,
      position: WORK_EXPERIENCE_VALIDATION_MESSAGES.required,
      startDate: WORK_EXPERIENCE_VALIDATION_MESSAGES.required,
      endDate: WORK_EXPERIENCE_VALIDATION_MESSAGES.endDateRequired,
    });
  });

  it("rejects an end date earlier than the start date", () => {
    expect(validateWorkExperience({ ...VALID_VALUES, endDate: "2024-06-30" }).endDate).toBe(
      WORK_EXPERIENCE_VALIDATION_MESSAGES.endDateBeforeStartDate,
    );
  });

  it("rejects a company name longer than the limit", () => {
    expect(validateWorkExperience({ ...VALID_VALUES, companyName: "a".repeat(101) }).companyName).toBe(
      WORK_EXPERIENCE_VALIDATION_MESSAGES.companyNameTooLong,
    );
  });
});
