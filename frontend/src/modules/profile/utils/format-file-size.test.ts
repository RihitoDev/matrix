import { describe, expect, it } from "vitest";
import { formatFileSize } from "./format-file-size";

describe("formatFileSize", () => {
  it("formats sizes under 1 MB in KB", () => {
    expect(formatFileSize(358400)).toBe("350 KB");
    expect(formatFileSize(512)).toBe("0.5 KB");
  });

  it("formats sizes from 1 MB in MB with one decimal", () => {
    expect(formatFileSize(1258291)).toBe("1.2 MB");
  });

  it("drops the decimal when it is zero", () => {
    expect(formatFileSize(5242880)).toBe("5 MB");
    expect(formatFileSize(1048576)).toBe("1 MB");
  });
});
