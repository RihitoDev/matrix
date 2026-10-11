import { describe, expect, it } from "vitest";
import { MAX_FILE_SIZE_BYTES } from "../config/file-upload.config";
import { getHttpStatus } from "./get-http-status";
import { validatePhotoFile } from "./validate-photo-file";

const INVALID_TYPE_MESSAGE = "La fotografía debe estar en formato JPG o PNG.";

function createFile(name: string, type: string, size = 4): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe("validatePhotoFile", () => {
  it.each([
    ["photo.png", "image/png"],
    ["photo.jpg", "image/jpeg"],
    ["photo.jpeg", ""],
  ])("accepts %s", (name, type) => {
    expect(validatePhotoFile(createFile(name, type))).toBeNull();
  });

  it.each([
    ["photo.gif", "image/gif"],
    ["cv.pdf", "application/pdf"],
    ["photo.webp", ""],
  ])("rejects %s", (name, type) => {
    expect(validatePhotoFile(createFile(name, type))).toBe(INVALID_TYPE_MESSAGE);
  });

  it("rejects a photo bigger than 5 MB", () => {
    expect(validatePhotoFile(createFile("photo.png", "image/png", MAX_FILE_SIZE_BYTES + 1))).toBe(
      "El archivo supera el límite de 5 MB.",
    );
  });
});

describe("getHttpStatus", () => {
  it("returns the status of a failed request", () => {
    expect(getHttpStatus({ response: { status: 413 } })).toBe(413);
  });

  it.each([null, "error", new Error("Network error"), { response: {} }, { response: { status: "500" } }])(
    "returns undefined for %o",
    (error) => {
      expect(getHttpStatus(error)).toBeUndefined();
    },
  );
});
