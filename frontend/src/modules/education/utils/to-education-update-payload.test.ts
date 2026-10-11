import { describe, expect, it } from "vitest";
import type { EducationItem } from "../types/education-item.types";
import { toEducationFormValues } from "./to-education-form-values";
import { toEducationUpdatePayload } from "./to-education-update-payload";

const RECORD: EducationItem = {
  id: "11111111-1111-4111-8111-111111111111",
  institution: "University",
  degree: "Engineering",
  startDate: "2020-01-01",
  endDate: null,
  description: null,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("toEducationUpdatePayload", () => {
  it("omits a legacy missing end date instead of serializing an empty string or null", () => {
    const values = { ...toEducationFormValues(RECORD), description: " Updated " };
    const payload = toEducationUpdatePayload(values, RECORD);
    expect(payload).not.toHaveProperty("endDate");
    expect(payload.description).toBe("Updated");
  });

  it("includes a supplied end date when completing a legacy record", () => {
    const values = { ...toEducationFormValues(RECORD), endDate: "2024-01-01" };
    expect(toEducationUpdatePayload(values, RECORD).endDate).toBe("2024-01-01");
  });

  it("does not silently omit an invalid attempt to clear an existing date", () => {
    const original = { ...RECORD, endDate: "2024-01-01" };
    const values = { ...toEducationFormValues(original), endDate: "" };
    expect(toEducationUpdatePayload(values, original)).toHaveProperty("endDate", "");
  });
});
