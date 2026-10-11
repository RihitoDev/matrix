import { describe, expect, it } from "vitest";
import { getFileFormat } from "./get-file-format";

describe("getFileFormat", () => {
  it("detects the document format from the file name", () => {
    expect(getFileFormat("scrum.PDF")).toBe("PDF");
    expect(getFileFormat("photo.jpeg")).toBe("JPG");
    expect(getFileFormat("photo.png")).toBe("PNG");
  });

  it("uppercases an unknown extension and handles names without one", () => {
    expect(getFileFormat("notes.txt")).toBe("TXT");
    expect(getFileFormat("")).toBe("");
  });
});
