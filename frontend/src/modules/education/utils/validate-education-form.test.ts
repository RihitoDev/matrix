import { describe, expect, it } from "vitest";
import type { EducationFormValues } from "../types/education-form-values.types";
import { validateEducationForm } from "./validate-education-form";

const VALUES: EducationFormValues = {
  institution: "University",
  degree: "Engineering",
  startDate: "2020-02-29",
  endDate: "2024-02-29",
  description: "",
};

describe("validateEducationForm", () => {
  it("allows an empty description and equal start and end dates", () => {
    expect(validateEducationForm(VALUES)).toEqual({});
    expect(
      validateEducationForm({ ...VALUES, endDate: VALUES.startDate }),
    ).toEqual({});
  });

  it.each(["institution", "degree", "startDate", "endDate"] as const)(
    "requires %s",
    (field) => {
      for (const value of ["", " ", null, undefined]) {
        expect(
          validateEducationForm({
            ...VALUES,
            [field]: value,
          } as EducationFormValues)[field],
        ).toBeTruthy();
      }
    },
  );

  it.each([
    "2023-02-29",
    "2024-02-30",
    "2024-13-01",
    "01/01/2024",
    "2024-01-01T00:00:00Z",
  ])("rejects invalid calendar date %s", (date) => {
    expect(
      validateEducationForm({ ...VALUES, startDate: date }).startDate,
    ).toBeTruthy();
    expect(
      validateEducationForm({ ...VALUES, endDate: date }).endDate,
    ).toBeTruthy();
  });

  it("rejects a reversed range even within the same month", () => {
    expect(validateEducationForm({ ...VALUES, endDate: "2020-02-28" })).toEqual(
      {
        endDate: "La fecha de fin no puede ser anterior a la fecha de inicio.",
      },
    );
  });

  it("allows preserving a missing end date only when explicitly enabled", () => {
    const legacy = { ...VALUES, endDate: "" };
    expect(validateEducationForm(legacy, true)).toEqual({});
    expect(validateEducationForm(legacy).endDate).toBeTruthy();
    expect(validateEducationForm({ ...legacy, startDate: "" }, true).startDate).toBeTruthy();
  });

  it.each(["2020-02-28", "2024-13-01", " "])("still rejects invalid supplied end date %s for legacy records", (endDate) => {
    expect(validateEducationForm({ ...VALUES, endDate }, true).endDate).toBeTruthy();
  });
});
