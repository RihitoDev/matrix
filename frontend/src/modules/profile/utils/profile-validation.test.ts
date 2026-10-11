import { describe, expect, it } from "vitest";
import { PROFILE_VALIDATION_MESSAGES } from "../constants/profile-validation.constants";
import type { PersonalInfoValues } from "../types/personal-info-values.types";
import { getFieldErrorId, getFieldErrorProps } from "./get-field-error-props";
import { isValidEmail } from "./is-valid-email";
import { isValidPhone } from "./is-valid-phone";
import { validatePersonalInfo } from "./validate-personal-info";
import { validatePresentation } from "./validate-presentation";

const VALID_PERSONAL_INFO: PersonalInfoValues = {
  firstName: "Valeria",
  lastName: "Quispe",
  cityId: "city-cochabamba",
  phone: "+591 70000000",
  personalEmail: "valeria@correo.com",
};

describe("isValidEmail", () => {
  it.each(["valeria@correo.com", "v.quispe@umss.edu.bo"])("accepts %s", (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  it.each(["valeria", "valeria@correo", "@correo.com", "vale ria@correo.com"])(
    "rejects %s",
    (email) => {
      expect(isValidEmail(email)).toBe(false);
    },
  );
});

describe("isValidPhone", () => {
  it.each(["70000000", "+591 70000000", "+591 700-00000", "4425566"])("accepts %s", (phone) => {
    expect(isValidPhone(phone)).toBe(true);
  });

  it.each(["123456", "+591 7000 0000 0000 0", "70a00000", "591+70000000"])(
    "rejects %s",
    (phone) => {
      expect(isValidPhone(phone)).toBe(false);
    },
  );
});

describe("validatePersonalInfo", () => {
  it("returns no errors for valid values", () => {
    expect(validatePersonalInfo(VALID_PERSONAL_INFO)).toEqual({});
  });

  it("requires every field", () => {
    expect(
      validatePersonalInfo({
        firstName: "",
        lastName: "",
        cityId: "",
        phone: "",
        personalEmail: "",
      }),
    ).toEqual({
      firstName: PROFILE_VALIDATION_MESSAGES.required,
      lastName: PROFILE_VALIDATION_MESSAGES.required,
      cityId: PROFILE_VALIDATION_MESSAGES.cityRequired,
      phone: PROFILE_VALIDATION_MESSAGES.required,
      personalEmail: PROFILE_VALIDATION_MESSAGES.required,
    });
  });

  it("rejects names longer than the allowed length", () => {
    const longName = "a".repeat(101);

    expect(
      validatePersonalInfo({ ...VALID_PERSONAL_INFO, firstName: longName, lastName: longName }),
    ).toEqual({
      firstName: PROFILE_VALIDATION_MESSAGES.nameTooLong,
      lastName: PROFILE_VALIDATION_MESSAGES.nameTooLong,
    });
  });

  it("rejects an invalid phone and email format", () => {
    expect(
      validatePersonalInfo({ ...VALID_PERSONAL_INFO, phone: "123", personalEmail: "valeria" }),
    ).toEqual({
      phone: PROFILE_VALIDATION_MESSAGES.invalidPhone,
      personalEmail: PROFILE_VALIDATION_MESSAGES.invalidEmail,
    });
  });
});

describe("validatePresentation", () => {
  it("returns no errors when the required fields are filled", () => {
    expect(
      validatePresentation({
        headline: "Desarrolladora web junior",
        aboutMe: "Graduate from UMSS.",
        interestedOpportunities: "",
      }),
    ).toEqual({});
  });

  it("requires the headline and the about me text", () => {
    expect(
      validatePresentation({ headline: "", aboutMe: "", interestedOpportunities: "Remote work" }),
    ).toEqual({
      headline: PROFILE_VALIDATION_MESSAGES.required,
      aboutMe: PROFILE_VALIDATION_MESSAGES.required,
    });
  });
});

describe("getFieldErrorProps", () => {
  it("links the control with its error message", () => {
    expect(getFieldErrorProps("phone", "Invalid phone")).toEqual({
      "aria-invalid": true,
      "aria-describedby": getFieldErrorId("phone"),
    });
  });

  it("marks the control as valid when there is no error", () => {
    expect(getFieldErrorProps("phone")).toEqual({
      "aria-invalid": false,
      "aria-describedby": undefined,
    });
  });
});
