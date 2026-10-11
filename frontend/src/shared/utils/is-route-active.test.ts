import { describe, expect, it } from "vitest";
import { isRouteActive } from "./is-route-active";

describe("isRouteActive", () => {
  it("matches the exact route", () => {
    expect(isRouteActive("/profile", "/profile")).toBe(true);
  });

  it("matches nested routes", () => {
    expect(isRouteActive("/profile/documents", "/profile")).toBe(true);
  });

  it("does not match routes that only share a prefix", () => {
    expect(isRouteActive("/profiles", "/profile")).toBe(false);
  });

  it("matches additional configured route patterns", () => {
    expect(
      isRouteActive("/mentors/42", "/mentorship/mentors", [
        /^\/mentors\/[^/]+$/,
      ]),
    ).toBe(true);
  });
});
