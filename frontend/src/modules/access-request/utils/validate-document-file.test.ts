import { describe, expect, it } from "vitest";
import {
  EMPTY_FILE_MESSAGE,
  FILE_TOO_LARGE_MESSAGE,
  INVALID_FORMAT_MESSAGE,
  MAX_DOCUMENT_SIZE_BYTES,
  validateDocumentFile,
} from "./validate-document-file";

const MB = 1024 * 1024;

describe("validateDocumentFile", () => {
  it("define el máximo en 10 MB", () => {
    expect(MAX_DOCUMENT_SIZE_BYTES).toBe(10 * MB);
  });

  it.each([
    ["foto.jpg", "image/jpeg"],
    ["foto.jpeg", "image/jpeg"],
    ["foto.png", "image/png"],
    ["titulo.pdf", "application/pdf"],
  ])("acepta %s con MIME %s", (name, type) => {
    expect(validateDocumentFile({ name, type, size: 1000 })).toBeNull();
  });

  it.each([
    ["informe.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    ["animacion.gif", "image/gif"],
    ["programa.exe", "application/x-msdownload"],
  ])("rechaza %s por formato", (name, type) => {
    expect(validateDocumentFile({ name, type, size: 1000 })).toBe(INVALID_FORMAT_MESSAGE);
  });

  it("con MIME informado manda el MIME aunque la extensión parezca válida", () => {
    expect(validateDocumentFile({ name: "falso.pdf", type: "image/gif", size: 1000 })).toBe(INVALID_FORMAT_MESSAGE);
  });

  it.each([".jpg", ".jpeg", ".png", ".pdf", ".PDF", ".Png", ".JPEG"])("con MIME vacío acepta la extensión %s", (extension) => {
    expect(validateDocumentFile({ name: `archivo${extension}`, type: "", size: 1000 })).toBeNull();
  });

  it.each(["archivo.docx", "archivo.gif", "archivo.exe", "archivo", "pdf"])("con MIME vacío rechaza %s", (name) => {
    expect(validateDocumentFile({ name, type: "", size: 1000 })).toBe(INVALID_FORMAT_MESSAGE);
  });

  it("acepta el MIME en mayúsculas", () => {
    expect(validateDocumentFile({ name: "a.pdf", type: "Application/PDF", size: 1000 })).toBeNull();
  });

  it("rechaza 0 bytes como vacío", () => {
    expect(validateDocumentFile({ name: "a.pdf", type: "application/pdf", size: 0 })).toBe(EMPTY_FILE_MESSAGE);
  });

  it("acepta exactamente 10 MB", () => {
    expect(validateDocumentFile({ name: "a.pdf", type: "application/pdf", size: 10 * MB })).toBeNull();
  });

  it("rechaza 10 MB + 1 byte", () => {
    expect(validateDocumentFile({ name: "a.pdf", type: "application/pdf", size: 10 * MB + 1 })).toBe(FILE_TOO_LARGE_MESSAGE);
  });

  it("usa los mensajes del issue", () => {
    expect(INVALID_FORMAT_MESSAGE).toBe("Formato no permitido. Solo se aceptan archivos JPG, PNG o PDF.");
    expect(FILE_TOO_LARGE_MESSAGE).toBe("El archivo supera el máximo de 10 MB.");
  });

  it("evalúa primero el formato, luego vacío y luego el tamaño", () => {
    expect(validateDocumentFile({ name: "a.exe", type: "application/x-msdownload", size: 0 })).toBe(INVALID_FORMAT_MESSAGE);
    expect(validateDocumentFile({ name: "a.exe", type: "application/x-msdownload", size: 20 * MB })).toBe(INVALID_FORMAT_MESSAGE);
    expect(validateDocumentFile({ name: "a.pdf", type: "application/pdf", size: 0 })).toBe(EMPTY_FILE_MESSAGE);
  });
});
