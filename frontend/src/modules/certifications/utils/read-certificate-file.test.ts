import { describe, expect, it, vi } from "vitest";
import { CERTIFICATION_DOCUMENT_MESSAGES } from "../config/certification-document.config";
import { readCertificateFile } from "./read-certificate-file";

function createFile(name: string, type: string, content = "contenido"): File {
  return new File([content], name, { type });
}

describe("readCertificateFile", () => {
  it("accepts a readable pdf", async () => {
    await expect(readCertificateFile(createFile("certificado.pdf", "application/pdf"))).resolves.toBeNull();
  });

  it("returns the validation error without reading an invalid file", async () => {
    const file = createFile("notas.txt", "text/plain");
    const readSpy = vi.spyOn(file, "arrayBuffer");

    await expect(readCertificateFile(file)).resolves.toBe("El archivo debe ser PDF, PNG o JPG.");
    expect(readSpy).not.toHaveBeenCalled();
  });

  it("returns the validation error for an empty file", async () => {
    await expect(readCertificateFile(createFile("vacio.pdf", "application/pdf", ""))).resolves.toBe(
      "El archivo está vacío. Selecciona otro archivo.",
    );
  });

  it("reports a file that cannot be read", async () => {
    const file = createFile("certificado.pdf", "application/pdf");
    vi.spyOn(file, "arrayBuffer").mockRejectedValue(new Error("unreadable"));

    await expect(readCertificateFile(file)).resolves.toBe(CERTIFICATION_DOCUMENT_MESSAGES.readError);
  });
});
