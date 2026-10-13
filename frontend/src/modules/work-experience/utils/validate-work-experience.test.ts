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

  it.each([
    ["0012-02-10", WORK_EXPERIENCE_VALIDATION_MESSAGES.dateBeforeMinimum],
    ["1949-12-31", WORK_EXPERIENCE_VALIDATION_MESSAGES.dateBeforeMinimum],
    ["20245-01-01", WORK_EXPERIENCE_VALIDATION_MESSAGES.invalidDate],
    ["2024-02-30", WORK_EXPERIENCE_VALIDATION_MESSAGES.invalidDate],
    ["2999-01-01", WORK_EXPERIENCE_VALIDATION_MESSAGES.futureDate],
  ])("rejects the start date %s", (startDate, message) => {
    expect(validateWorkExperience({ ...VALID_VALUES, startDate }).startDate).toBe(message);
  });

  it("accepts the minimum date", () => {
    expect(
      validateWorkExperience({ ...VALID_VALUES, startDate: "1950-01-01" }),
    ).toEqual({});
  });

  it("rejects an end date out of range without comparing it with the start date", () => {
    expect(validateWorkExperience({ ...VALID_VALUES, endDate: "0012-01-01" })).toEqual({
      endDate: WORK_EXPERIENCE_VALIDATION_MESSAGES.dateBeforeMinimum,
    });
  });

  it("rejects a position and a description longer than the limits", () => {
    expect(
      validateWorkExperience({
        ...VALID_VALUES,
        position: "a".repeat(151),
        description: "b".repeat(2001),
      }),
    ).toEqual({
      position: WORK_EXPERIENCE_VALIDATION_MESSAGES.positionTooLong,
      description: WORK_EXPERIENCE_VALIDATION_MESSAGES.descriptionTooLong,
    });
  });
});
