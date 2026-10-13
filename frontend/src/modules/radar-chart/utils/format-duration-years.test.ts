import { describe, expect, it } from "vitest";
import { formatDurationYears } from "./format-duration-years";

describe("formatDurationYears", () => {
  it("uses the singular for one year", () => {
    expect(formatDurationYears(1)).toBe("1 año");
  });

  it("uses the plural for several years", () => {
    expect(formatDurationYears(3)).toBe("3 años");
  });

  it("shows fractional years with a decimal comma", () => {
    expect(formatDurationYears(1.5)).toBe("1,5 años");
  });
});
