import { describe, expect, it } from "vitest";
import { formatGap } from "./format-gap";

describe("formatGap", () => {
  it("adds a plus sign to a positive gap", () => {
    expect(formatGap(2.3)).toBe("+2,3");
  });

  it("keeps the minus sign of a negative gap", () => {
    expect(formatGap(-1.8)).toBe("-1,8");
  });

  it("shows zero without a sign", () => {
    expect(formatGap(0)).toBe("0,0");
    expect(formatGap(-0)).toBe("0,0");
  });

  it("always shows one decimal", () => {
    expect(formatGap(1)).toBe("+1,0");
  });
});
