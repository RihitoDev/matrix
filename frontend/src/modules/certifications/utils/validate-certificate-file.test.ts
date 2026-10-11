import { describe, expect, it } from "vitest";
import { MAX_FILE_SIZE_BYTES } from "@/modules/profile/config/file-upload.config";
import { validateCertificateFile } from "./validate-certificate-file";

const INVALID_TYPE_MESSAGE = "El archivo debe ser PDF, PNG o JPG.";

function createFile(name: string, type: string, size = 4): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe("validateCertificateFile", () => {
  it.each([
    ["certificado.pdf", "application/pdf"],
    ["certificado.png", "image/png"],
    ["certificado.jpg", "image/jpeg"],
  ])("accepts pdf, png and jpg files (%s)", (name, type) => {
    expect(validateCertificateFile(createFile(name, type))).toBeNull();
  });

  it.each([
    ["certificado.gif", "image/gif"],
    ["notas.txt", "text/plain"],
    ["certificado.gif", ""],
  ])("rejects a file that is not pdf, png or jpg (%s, type %j)", (name, type) => {
    expect(validateCertificateFile(createFile(name, type))).toBe(INVALID_TYPE_MESSAGE);
  });

  it.each(["certificado.pdf", "certificado.png", "certificado.jpg", "CERTIFICADO.JPEG"])(
    "accepts files without a mime type by their extension (%s)",
    (name) => {
      expect(validateCertificateFile(createFile(name, ""))).toBeNull();
    },
  );

  it("rejects an empty file", () => {
    expect(validateCertificateFile(createFile("certificado.png", "image/png", 0))).toBe(
      "El archivo está vacío. Selecciona otro archivo.",
    );
  });

  it("rejects a file larger than 5 MB", () => {
    expect(
      validateCertificateFile(createFile("certificado.png", "image/png", MAX_FILE_SIZE_BYTES + 1)),
    ).toBe("El archivo supera el límite de 5 MB.");
  });

  it("returns null for a file of exactly 5 MB", () => {
    expect(
      validateCertificateFile(createFile("certificado.png", "image/png", MAX_FILE_SIZE_BYTES)),
    ).toBeNull();
  });
});
