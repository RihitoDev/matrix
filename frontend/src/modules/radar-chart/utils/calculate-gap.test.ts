import { describe, expect, it } from "vitest";
import { calculateGap } from "./calculate-gap";

describe("calculateGap", () => {
  it("rounds a positive gap away from zero", () => {
    expect(calculateGap(8.5, 6.25)).toBe(2.3);
  });

  it("rounds a negative gap away from zero", () => {
    expect(calculateGap(4.5, 6.25)).toBe(-1.8);
  });

  it("returns zero when the score equals the average", () => {
    expect(calculateGap(6.25, 6.25)).toBe(0);
  });
});
