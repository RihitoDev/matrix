import { describe, expect, it } from "vitest";
import { getInitials } from "./get-initials";
import { trimFormValues } from "./trim-form-values";

describe("getInitials", () => {
  it("returns up to two uppercase initials", () => {
    expect(getInitials("valeria quispe rojas")).toBe("VQ");
    expect(getInitials("  Valeria  ")).toBe("V");
  });

  it("returns an empty string for an empty name", () => {
    expect(getInitials("   ")).toBe("");
  });
});

describe("trimFormValues", () => {
  it("trims every value", () => {
    expect(trimFormValues({ firstName: "  Valeria ", phone: " 7000 " })).toEqual({
      firstName: "Valeria",
      phone: "7000",
    });
  });
});
