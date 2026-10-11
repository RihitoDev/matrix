import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CERTIFICATION_VALIDATION_MESSAGES } from "../config/certification-validation.config";
import type { CreateCertificationDto } from "../types/create-certification-dto.types";
import { getTodayIsoDate, validateCertification } from "./validate-certification";

const VALID_VALUES: CreateCertificationDto = {
  name: "AWS Certified Cloud Practitioner",
  issuingOrganization: "Amazon Web Services",
  issueDate: "2025-03-10",
};

describe("validateCertification", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-06-15T16:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns no errors for valid values", () => {
    expect(validateCertification(VALID_VALUES)).toEqual({});
  });

  it("requires every field", () => {
    expect(
      validateCertification({ name: "", issuingOrganization: "", issueDate: "" }),
    ).toEqual({
      name: CERTIFICATION_VALIDATION_MESSAGES.required,
      issuingOrganization: CERTIFICATION_VALIDATION_MESSAGES.required,
      issueDate: CERTIFICATION_VALIDATION_MESSAGES.required,
    });
  });

  it("accepts a name of 150 characters and rejects a longer one", () => {
    expect(validateCertification({ ...VALID_VALUES, name: "a".repeat(150) })).toEqual({});
    expect(validateCertification({ ...VALID_VALUES, name: "a".repeat(151) })).toEqual({
      name: CERTIFICATION_VALIDATION_MESSAGES.nameTooLong,
    });
  });

  it("accepts an organization of 100 characters and rejects a longer one", () => {
    expect(
      validateCertification({ ...VALID_VALUES, issuingOrganization: "a".repeat(100) }),
    ).toEqual({});
    expect(
      validateCertification({ ...VALID_VALUES, issuingOrganization: "a".repeat(101) }),
    ).toEqual({ issuingOrganization: CERTIFICATION_VALIDATION_MESSAGES.organizationTooLong });
  });

  it("reports only the empty field and leaves the valid ones without errors", () => {
    expect(validateCertification({ ...VALID_VALUES, issueDate: "" })).toEqual({
      issueDate: CERTIFICATION_VALIDATION_MESSAGES.required,
    });
    expect(validateCertification({ ...VALID_VALUES, name: "" })).toEqual({
      name: CERTIFICATION_VALIDATION_MESSAGES.required,
    });
  });

  it("treats values made only of spaces as empty", () => {
    expect(
      validateCertification({ name: "   ", issuingOrganization: "\t ", issueDate: "  " }),
    ).toEqual({
      name: CERTIFICATION_VALIDATION_MESSAGES.required,
      issuingOrganization: CERTIFICATION_VALIDATION_MESSAGES.required,
      issueDate: CERTIFICATION_VALIDATION_MESSAGES.required,
    });
  });

  it("counts the length after trimming the spaces", () => {
    expect(validateCertification({ ...VALID_VALUES, name: ` ${"a".repeat(150)} ` })).toEqual({});
    expect(
      validateCertification({ ...VALID_VALUES, issuingOrganization: ` ${"a".repeat(100)} ` }),
    ).toEqual({});
  });

  it("does not fail when a field is missing", () => {
    const missing = {} as CreateCertificationDto;

    expect(validateCertification(missing)).toEqual({
      name: CERTIFICATION_VALIDATION_MESSAGES.required,
      issuingOrganization: CERTIFICATION_VALIDATION_MESSAGES.required,
      issueDate: CERTIFICATION_VALIDATION_MESSAGES.required,
    });
  });

  it("rejects html and script tags", () => {
    expect(
      validateCertification({
        name: "<script>alert(1)</script>",
        issuingOrganization: "<b>Media</b>",
        issueDate: "2025-03-10",
      }),
    ).toEqual({
      name: "No se permiten etiquetas HTML ni scripts",
      issuingOrganization: "No se permiten etiquetas HTML ni scripts",
    });
  });

  it("accepts SQL injection characters because they are rendered as plain text", () => {
    expect(
      validateCertification({
        name: "O'Reilly \"Media\"; DROP TABLE",
        issuingOrganization: "O'Reilly \"Media\"; DROP TABLE",
        issueDate: "2025-03-10",
      }),
    ).toEqual({});
  });

  it.each(["10/03/2025", "2025-13-01", "2025-02-30", "not-a-date"])(
    "rejects the invalid date %s",
    (issueDate) => {
      expect(validateCertification({ ...VALID_VALUES, issueDate })).toEqual({
        issueDate: CERTIFICATION_VALIDATION_MESSAGES.invalidDate,
      });
    },
  );

  it("accepts today as the issue date", () => {
    expect(validateCertification({ ...VALID_VALUES, issueDate: "2026-06-15" })).toEqual({});
  });

  it("treats the date in America/La_Paz as today shortly after midnight UTC", () => {
    vi.setSystemTime(new Date("2026-06-16T02:00:00Z"));

    expect(validateCertification({ ...VALID_VALUES, issueDate: "2026-06-15" })).toEqual({});
    expect(validateCertification({ ...VALID_VALUES, issueDate: "2026-06-16" })).toEqual({
      issueDate: CERTIFICATION_VALIDATION_MESSAGES.futureDate,
    });
  });

  it("switches to the next day exactly at 04:00 UTC", () => {
    vi.setSystemTime(new Date("2026-06-16T03:59:59Z"));
    expect(validateCertification({ ...VALID_VALUES, issueDate: "2026-06-16" })).toEqual({
      issueDate: CERTIFICATION_VALIDATION_MESSAGES.futureDate,
    });

    vi.setSystemTime(new Date("2026-06-16T04:00:00Z"));
    expect(validateCertification({ ...VALID_VALUES, issueDate: "2026-06-16" })).toEqual({});
  });

  it("rejects a future issue date", () => {
    expect(validateCertification({ ...VALID_VALUES, issueDate: "2026-06-16" })).toEqual({
      issueDate: CERTIFICATION_VALIDATION_MESSAGES.futureDate,
    });
  });
});

describe("getTodayIsoDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats the America/La_Paz date as yyyy-mm-dd", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-05T13:00:00Z"));

    expect(getTodayIsoDate()).toBe("2026-01-05");
  });

  it("keeps the previous day between 00:00 and 04:00 UTC", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-06T03:30:00Z"));

    expect(getTodayIsoDate()).toBe("2026-01-05");
  });

  it("rolls over the year using the La_Paz calendar", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-01T03:59:00Z"));

    expect(getTodayIsoDate()).toBe("2025-12-31");
  });
});
