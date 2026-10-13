import { describe, expect, it } from "vitest";
import { isCorruptedFileError } from "./is-corrupted-file-error";

function createError(status: unknown, data: unknown) {
  return { response: { status, data } };
}

describe("isCorruptedFileError", () => {
  it("detects a 400 response with the corrupted file code", () => {
    expect(isCorruptedFileError(createError(400, { data: { code: "CORRUPTED_FILE" } }))).toBe(true);
  });

  it("ignores a 400 response with another code or without one", () => {
    expect(isCorruptedFileError(createError(400, { data: { code: "OTHER" } }))).toBe(false);
    expect(isCorruptedFileError(createError(400, { data: null }))).toBe(false);
    expect(isCorruptedFileError(createError(400, null))).toBe(false);
    expect(isCorruptedFileError(createError(400, undefined))).toBe(false);
  });

  it("ignores the code under another status", () => {
    expect(isCorruptedFileError(createError(422, { data: { code: "CORRUPTED_FILE" } }))).toBe(false);
    expect(isCorruptedFileError(createError(500, { data: { code: "CORRUPTED_FILE" } }))).toBe(false);
  });

  it("does not compare the message text", () => {
    expect(
      isCorruptedFileError(
        createError(400, { detail: "File content is incomplete or corrupted", data: null }),
      ),
    ).toBe(false);
  });

  it("ignores values that are not http errors", () => {
    expect(isCorruptedFileError(new Error("failed"))).toBe(false);
    expect(isCorruptedFileError(null)).toBe(false);
    expect(isCorruptedFileError("400")).toBe(false);
  });
});
