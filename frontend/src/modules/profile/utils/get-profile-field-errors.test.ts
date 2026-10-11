import { describe, expect, it } from "vitest";
import { PROFILE_SERVER_FIELD_MESSAGES } from "../constants/profile-validation.constants";
import { getProfileFieldErrors } from "./get-profile-field-errors";

function validationError(data: unknown) {
  return { response: { status: 400, data: { statusCode: 400, data, detail: "", ok: false } } };
}

describe("getProfileFieldErrors", () => {
  it("maps each server field error to its Spanish message", () => {
    const errors = getProfileFieldErrors(
      validationError([
        { field: "headline", message: "Too big" },
        { field: "personalEmail", message: "Invalid email address" },
      ]),
    );

    expect(errors).toEqual({
      headline: PROFILE_SERVER_FIELD_MESSAGES.headline,
      personalEmail: PROFILE_SERVER_FIELD_MESSAGES.personalEmail,
    });
  });

  it("ignores unknown fields and malformed issues", () => {
    expect(
      getProfileFieldErrors(validationError([{ field: "password" }, null, "headline"])),
    ).toEqual({});
  });

  it.each([
    null,
    new Error("Network error"),
    { response: null },
    { response: { data: null } },
    { response: { data: { data: "not a list" } } },
  ])("returns no field errors for %o", (error) => {
    expect(getProfileFieldErrors(error)).toEqual({});
  });
});
