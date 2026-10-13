import { describe, expect, it } from "vitest";
import { getAreaLevel } from "./get-area-level";

describe("getAreaLevel", () => {
  it.each([
    [0, "Bajo"],
    [3.9, "Bajo"],
    [4, "Medio"],
    [6.4, "Medio"],
    [6.5, "Alto"],
    [8.4, "Alto"],
    [8.5, "Experto"],
    [10, "Experto"],
  ])("returns the level for a score of %s", (score, level) => {
    expect(getAreaLevel(score)).toBe(level);
  });
});
