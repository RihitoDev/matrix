import { describe, expect, it } from "vitest";
import { calculateAverage } from "./calculate-average";

describe("calculateAverage", () => {
  it("returns the mean of the values", () => {
    expect(calculateAverage([8.5, 7, 6.5, 5, 4.5, 6])).toBe(6.25);
  });

  it("returns 0 when there are no values", () => {
    expect(calculateAverage([])).toBe(0);
  });
});
