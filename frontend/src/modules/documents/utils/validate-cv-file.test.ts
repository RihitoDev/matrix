import { describe, expect, it } from "vitest";
import { MAX_FILE_SIZE_BYTES } from "@/modules/profile/config/file-upload.config";
import { validateCvFile } from "./validate-cv-file";

const PDF_TYPE = "application/pdf";

function createFile(name: string, type: string, size = 4): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe("validateCvFile", () => {
  it("returns null for a valid pdf", () => {
    expect(validateCvFile(createFile("cv.pdf", PDF_TYPE))).toBeNull();
  });

  it("returns null for a pdf of exactly 5 MB", () => {
    expect(validateCvFile(createFile("cv.pdf", PDF_TYPE, MAX_FILE_SIZE_BYTES))).toBeNull();
  });

  it.each([
    ["cv.png", "image/png"],
    ["cv.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ])("rejects a file that is not a pdf (%s)", (name, type) => {
    expect(validateCvFile(createFile(name, type))).toBe("El CV debe estar en formato PDF.");
  });

  it("accepts a pdf without a mime type by its extension", () => {
    expect(validateCvFile(createFile("cv.pdf", ""))).toBeNull();
  });

  it("rejects a file without a mime type and a non pdf extension", () => {
    expect(validateCvFile(createFile("cv.txt", ""))).toBe("El CV debe estar en formato PDF.");
  });

  it("rejects an empty pdf", () => {
    expect(validateCvFile(createFile("cv.pdf", PDF_TYPE, 0))).toBe(
      "El archivo está vacío. Selecciona otro archivo.",
    );
  });

  it("rejects a pdf larger than 5 MB", () => {
    const message = validateCvFile(createFile("cv.pdf", PDF_TYPE, MAX_FILE_SIZE_BYTES + 1));

    expect(message).toBe("El archivo supera el límite de 5 MB.");
    expect(message).toContain("5 MB");
  });

  it("reports the type error before the size error", () => {
    expect(validateCvFile(createFile("cv.png", "image/png", MAX_FILE_SIZE_BYTES + 1))).toBe(
      "El CV debe estar en formato PDF.",
    );
  });
});
