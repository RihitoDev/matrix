import { describe, expect, it } from "vitest";
import { formatDecimal } from "./format-decimal";

describe("formatDecimal", () => {
  it("uses a decimal comma", () => {
    expect(formatDecimal(8.5)).toBe("8,5");
    expect(formatDecimal(6.25)).toBe("6,25");
  });

  it("keeps integers without decimals by default", () => {
    expect(formatDecimal(7)).toBe("7");
  });

  it("forces the given number of decimals", () => {
    expect(formatDecimal(7, 1)).toBe("7,0");
    expect(formatDecimal(6.25, 1)).toBe("6,3");
    expect(formatDecimal(-1.8, 1)).toBe("-1,8");
  });
});
