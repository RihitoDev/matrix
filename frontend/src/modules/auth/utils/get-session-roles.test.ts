import { describe, expect, it } from "vitest";
import { getSessionRoles } from "./get-session-roles";

function getToken(payload: unknown) {
  return `h.${btoa(JSON.stringify(payload))}.s`;
}

describe("getSessionRoles", () => {
  it("reads every known role and removes duplicates and unknown roles", () => {
    expect(getSessionRoles(getToken({ roles: ["mentor", "titulado", "mentor", "unknown"] }))).toEqual(["titulado", "mentor"]);
  });

  it("supports existing sessions with a single roleTag", () => {
    expect(getSessionRoles(getToken({ roleTag: "administrativo" }))).toEqual(["administrativo"]);
  });

  it.each([null, "invalid", "h.invalid.s", getToken(null), getToken({ roleTag: "unknown" })])("does not grant roles for %s", (token) => {
    expect(getSessionRoles(token)).toEqual([]);
  });
});
