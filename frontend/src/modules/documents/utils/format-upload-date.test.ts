import { describe, expect, it } from "vitest";
import { formatUploadDate } from "./format-upload-date";

describe("formatUploadDate", () => {
  it("formats the date in spanish", () => {
    expect(formatUploadDate(new Date(2026, 8, 20))).toBe("20 sep 2026");
  });

  it.each([
    [0, "ene"],
    [1, "feb"],
    [2, "mar"],
    [3, "abr"],
    [4, "may"],
    [5, "jun"],
    [6, "jul"],
    [7, "ago"],
    [8, "sep"],
    [9, "oct"],
    [10, "nov"],
    [11, "dic"],
  ])("uses the short label of every month (month %i)", (monthIndex, label) => {
    expect(formatUploadDate(new Date(2026, monthIndex, 1))).toBe(`1 ${label} 2026`);
  });

  it("does not pad single digit days", () => {
    expect(formatUploadDate(new Date(2026, 0, 5))).toBe("5 ene 2026");
  });
});
