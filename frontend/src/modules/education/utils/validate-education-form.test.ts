import { describe, expect, it } from "vitest";
import type { EducationFormValues } from "../types/education-form-values.types";
import { validateEducationForm as validate } from "./validate-education-form";

const INSTITUTIONS = [{ name: 'Universidad Mayor de San Simón (UMSS)', aliases: ['UMSS', 'Universidad Mayor de San Simón'] }];
const validateEducationForm = (values: EducationFormValues, allowMissingEndDate = false) => validate(values, allowMissingEndDate, INSTITUTIONS);

const VALUES: EducationFormValues = {
  institution: "Universidad Mayor de San Simón (UMSS)",
  degree: "Ingeniería Civil",
  startDate: "2020-02-29",
  endDate: "2024-02-29",
  description: "",
};

describe("validateEducationForm", () => {
  it.each(['gggggg', 'UMSS extra', 'UNIPOL'])('rejects non-catalogue institution %s', (institution) => {
    expect(validateEducationForm({ ...VALUES, institution }).institution).toBe('Selecciona una universidad de la lista permitida.');
  });

  it('accepts aliases and names without accents, but fails closed without a catalogue', () => {
    for (const institution of ['UMSS', ' universidad mayor de san simon ', INSTITUTIONS[0].name]) {
      expect(validateEducationForm({ ...VALUES, institution })).toEqual({});
    }
    expect(validate(VALUES).institution).toBeTruthy();
  });

  it.each(['0001-01-01', '0201-01-01', '1899-12-31', '1939-12-31'])('rejects %s in either date field', (date) => {
    for (const field of ['startDate', 'endDate'] as const) {
      expect(validateEducationForm({ ...VALUES, [field]: date })[field]).toBe('Fecha inválida.');
    }
  });

  it('allows equal dates at the lower boundary', () => {
    expect(validateEducationForm({ ...VALUES, startDate: '1940-01-01', endDate: '1940-01-01' })).toEqual({});
  });
  it.each([0, 400])("accepts a description of %i characters", (length) => {
    expect(validateEducationForm({ ...VALUES, description: "a".repeat(length) })).toEqual({});
  });

  it.each(["a".repeat(401), " ".repeat(401)])("rejects an oversized description before trimming", (description) => {
    expect(validateEducationForm({ ...VALUES, description }).description).toBe(
      "La descripción no puede superar los 400 caracteres.",
    );
  });

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
