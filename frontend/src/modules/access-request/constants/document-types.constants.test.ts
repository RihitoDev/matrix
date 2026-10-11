import { describe, expect, it } from "vitest";
import { DOCUMENT_TYPES } from "./document-types.constants";

describe("DOCUMENT_TYPES", () => {
  it("espeja los títulos del catálogo del backend en su orden", () => {
    expect(DOCUMENT_TYPES).toEqual(["academic_diploma", "national_title"]);
  });

  it("no tiene valores repetidos", () => {
    expect(new Set(DOCUMENT_TYPES).size).toBe(DOCUMENT_TYPES.length);
  });
});
