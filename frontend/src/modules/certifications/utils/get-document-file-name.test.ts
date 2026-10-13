import { describe, expect, it } from "vitest";
import { getDocumentFileName } from "./get-document-file-name";

describe("getDocumentFileName", () => {
  it("prefers the name of the uploaded file", () => {
    expect(getDocumentFileName("Scrum Master", "application/pdf", "titulo.pdf")).toBe("titulo.pdf");
  });

  it.each([
    ["application/pdf", "Scrum Master.pdf"],
    ["image/png", "Scrum Master.png"],
    ["image/jpeg", "Scrum Master.jpg"],
  ])("builds the name from the certification and the %s type", (mimeType, expected) => {
    expect(getDocumentFileName("Scrum Master", mimeType)).toBe(expected);
  });

  it("uses only the certification name when the type is unknown", () => {
    expect(getDocumentFileName("Scrum Master", "")).toBe("Scrum Master");
  });
});
