import { describe, expect, it } from "vitest";
import { formatFileSize } from "./format-file-size";

describe("formatFileSize", () => {
  it.each([
    [0, "0 B"],
    [1, "1 B"],
    [1023, "1023 B"],
    [1024, "1 KB"],
    [1536, "2 KB"],
    [348160, "340 KB"],
    [1048575, "1024 KB"],
    [1048576, "1 MB"],
    [2415919, "2,3 MB"],
    [10485760, "10 MB"],
  ])("%d bytes se muestra como %s", (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });

  it("devuelve 0 B ante valores no válidos", () => {
    expect(formatFileSize(-5)).toBe("0 B");
    expect(formatFileSize(Number.NaN)).toBe("0 B");
  });
});
