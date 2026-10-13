import { describe, expect, it } from "vitest";
import { normalizeSearchText } from "./normalize-search-text";

describe("normalizeSearchText", () => {
  it("ignora mayúsculas, tildes y espacios de los extremos", () => {
    expect(normalizeSearchText("  FastAPI ")).toBe("fastapi");
    expect(normalizeSearchText("PYTHON")).toBe("python");
    expect(normalizeSearchText("Ánálisis")).toBe("analisis");
  });
});
