import { describe, expect, it } from "vitest";
import type { ProfileResponse } from "../types/profile-response.types";
import { getFullName } from "./get-full-name";
import { getProfileErrorMessage } from "./get-profile-error-message";
import { toPersonalInfoValues } from "./to-personal-info-values";
import { toPresentationValues } from "./to-presentation-values";
import { toProfileSummary } from "./to-profile-summary";

const EMPTY_PROFILE: ProfileResponse = {
  id: "11111111-1111-4111-8111-111111111111",
  firstName: "Valeria",
  lastName: "Quispe",
  institutionalEmail: "valeria.quispe@umss.edu.bo",
  personalEmail: null,
  phone: null,
  city: null,
  headline: null,
  aboutMe: null,
  updatedAt: "2026-10-04T12:00:00.000Z",
};

const COMPLETE_PROFILE: ProfileResponse = {
  ...EMPTY_PROFILE,
  personalEmail: "valeria@correo.com",
  phone: "+591 70000000",
  city: { id: "22222222-2222-4222-8222-222222222222", title: "Cochabamba" },
  headline: "Junior developer",
  aboutMe: "Graduate.",
};

describe("toPersonalInfoValues", () => {
  it("maps the profile to the form values", () => {
    expect(toPersonalInfoValues(COMPLETE_PROFILE)).toEqual({
      firstName: "Valeria",
      lastName: "Quispe",
      cityId: "22222222-2222-4222-8222-222222222222",
      phone: "+591 70000000",
      personalEmail: "valeria@correo.com",
    });
  });

  it("uses empty strings for missing values", () => {
    expect(toPersonalInfoValues(EMPTY_PROFILE)).toMatchObject({
      cityId: "",
      phone: "",
      personalEmail: "",
    });
  });
});

describe("toPresentationValues", () => {
  it("maps the stored presentation fields", () => {
    expect(toPresentationValues(COMPLETE_PROFILE)).toEqual({
      headline: "Junior developer",
      aboutMe: "Graduate.",
      interestedOpportunities: "",
    });
  });

  it("uses empty strings for missing values", () => {
    expect(toPresentationValues(EMPTY_PROFILE)).toEqual({
      headline: "",
      aboutMe: "",
      interestedOpportunities: "",
    });
  });
});

describe("toProfileSummary", () => {
  it("maps the profile to the summary shown in My profile", () => {
    expect(toProfileSummary(COMPLETE_PROFILE)).toEqual({
      fullName: "Valeria Quispe",
      headline: "Junior developer",
      city: "Cochabamba",
      phone: "+591 70000000",
      personalEmail: "valeria@correo.com",
      aboutMe: "Graduate.",
      interestedOpportunities: "",
    });
  });

  it("uses empty strings for missing values", () => {
    expect(toProfileSummary(EMPTY_PROFILE)).toMatchObject({ city: "", headline: "", phone: "" });
  });
});

describe("getFullName", () => {
  it("joins the trimmed names", () => {
    expect(getFullName({ firstName: " Valeria ", lastName: "Quispe" })).toBe("Valeria Quispe");
  });

  it("ignores missing names", () => {
    expect(
      getFullName({ firstName: "Valeria", lastName: null as unknown as string }),
    ).toBe("Valeria");
  });
});

describe("getProfileErrorMessage", () => {
  it("returns the message of a known status", () => {
    expect(getProfileErrorMessage({ response: { status: 401 } }, "Fallback")).toBe(
      "Tu sesión no es válida. Inicia sesión nuevamente.",
    );
  });

  it.each([{ response: { status: 500 } }, new Error("Network error")])(
    "returns the fallback message for %o",
    (error) => {
      expect(getProfileErrorMessage(error, "Fallback")).toBe("Fallback");
    },
  );
});
