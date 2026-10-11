import { describe, expect, it } from "vitest";
import type { EducationItem } from "../types/education-item.types";
import type { EducationFormValues } from "../types/education-form-values.types";
import { toEducationFormValues } from "./to-education-form-values";
import { toEducationPayload } from "./to-education-payload";

const EDUCATION: EducationItem = {
  id: "11111111-1111-4111-8111-111111111111",
  institution: "Example University",
  degree: "Computer Science",
  startDate: "2021-02-01T00:00:00.000Z",
  endDate: null,
  description: null,
  createdAt: "2025-12-01T00:00:00.000Z",
  updatedAt: "2025-12-01T00:00:00.000Z",
};

describe("toEducationFormValues", () => {
  it("uses empty strings for missing record fields", () => {
    const missing = { institution: null, degree: null, startDate: null } as unknown as EducationItem;

    expect(toEducationFormValues(missing)).toEqual({
      institution: "", degree: "", startDate: "", endDate: "", description: "",
    });
  });
  it("maps nullable fields to empty strings and keeps only the date part", () => {
    expect(toEducationFormValues(EDUCATION)).toEqual({
      institution: "Example University",
      degree: "Computer Science",
      startDate: "2021-02-01",
      endDate: "",
      description: "",
    });
  });

  it("keeps the end date and the description when present", () => {
    expect(
      toEducationFormValues({ ...EDUCATION, endDate: "2025-11-30", description: "Studies" }),
    ).toMatchObject({ endDate: "2025-11-30", description: "Studies" });
  });
});

describe("toEducationPayload", () => {
  it("handles missing form values without calling trim on null", () => {
    const missing = { institution: null, degree: null, description: null } as unknown as EducationFormValues;

    expect(toEducationPayload(missing)).toEqual({
      institution: "", degree: "", startDate: "", endDate: "", description: null,
    });
  });
  it("trims text and keeps required dates while clearing an empty description", () => {
    expect(
      toEducationPayload({
        institution: " Example University ",
        degree: " Computer Science ",
        startDate: "2021-02-01",
        endDate: "2025-11-30",
        description: "  ",
      }),
    ).toEqual({
      institution: "Example University",
      degree: "Computer Science",
      startDate: "2021-02-01",
      endDate: "2025-11-30",
      description: null,
    });
  });

  it("keeps the end date and the trimmed description", () => {
    expect(
      toEducationPayload({
        institution: "Example University",
        degree: "Computer Science",
        startDate: "2021-02-01",
        endDate: "2025-11-30",
        description: " Studies ",
      }),
    ).toMatchObject({ endDate: "2025-11-30", description: "Studies" });
  });
});
