import { describe, expect, it } from "vitest";
import { EMPTY_PROFILE_SUMMARY } from "../config/profile-summary-defaults.config";
import { isProfileComplete } from "./is-profile-complete";

const COMPLETE_PROFILE = {
  fullName: "Valeria Quispe",
  headline: "Desarrolladora web junior",
  city: "Cochabamba",
  phone: "+591 70000000",
  personalEmail: "valeria@correo.com",
  aboutMe: "Systems engineering graduate from UMSS.",
  interestedOpportunities: "",
};

describe("isProfileComplete", () => {
  it("returns true when every required field has a value", () => {
    expect(isProfileComplete(COMPLETE_PROFILE)).toBe(true);
  });

  it("returns false for an empty profile", () => {
    expect(isProfileComplete(EMPTY_PROFILE_SUMMARY)).toBe(false);
  });

  it("treats blank values as missing", () => {
    expect(isProfileComplete({ ...COMPLETE_PROFILE, phone: "   " })).toBe(false);
  });
});
