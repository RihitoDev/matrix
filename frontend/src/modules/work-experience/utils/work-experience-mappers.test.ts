import { describe, expect, it } from "vitest";
import { EMPTY_WORK_EXPERIENCE_FORM_VALUES } from "../config/work-experience-form-defaults.config";
import { toWorkExperienceFormValues } from "./to-work-experience-form-values";
import { toWorkExperiencePayload } from "./to-work-experience-payload";

describe("toWorkExperiencePayload", () => {
  it("trims the texts and keeps the selected dates", () => {
    expect(
      toWorkExperiencePayload({
        companyName: " Synapse Labs ",
        position: " Desarrolladora web ",
        startDate: "2024-07-01",
        endDate: "2024-12-31",
        isCurrent: false,
        description: " Interfaces con React ",
      }),
    ).toEqual({
      companyName: "Synapse Labs",
      position: "Desarrolladora web",
      startDate: "2024-07-01",
      endDate: "2024-12-31",
      isCurrent: false,
      description: "Interfaces con React",
    });
  });

  it("sends no end date for a current job and no description when it is empty", () => {
    const payload = toWorkExperiencePayload({
      ...EMPTY_WORK_EXPERIENCE_FORM_VALUES,
      companyName: "Synapse Labs",
      position: "Desarrolladora web",
      startDate: "2025-03-01",
      endDate: "2025-06-30",
      isCurrent: true,
      description: "   ",
    });

    expect(payload.endDate).toBeNull();
    expect(payload.description).toBeNull();
  });
});

describe("toWorkExperienceFormValues", () => {
  it("fills the form with a saved experience", () => {
    expect(
      toWorkExperienceFormValues({
        id: "experience-1",
        companyName: "Synapse Labs",
        position: "Desarrolladora web",
        startDate: "2024-07-01",
        endDate: "2024-12-31",
        isCurrent: false,
        description: "Interfaces con React",
      }),
    ).toEqual({
      companyName: "Synapse Labs",
      position: "Desarrolladora web",
      startDate: "2024-07-01",
      endDate: "2024-12-31",
      isCurrent: false,
      description: "Interfaces con React",
    });
  });

  it("uses empty texts when the end date and description are missing", () => {
    const values = toWorkExperienceFormValues({
      id: "experience-1",
      companyName: "Synapse Labs",
      position: "Desarrolladora web",
      startDate: "2025-03-01",
      endDate: null,
      isCurrent: true,
      description: null,
    });

    expect(values.endDate).toBe("");
    expect(values.description).toBe("");
  });
});
