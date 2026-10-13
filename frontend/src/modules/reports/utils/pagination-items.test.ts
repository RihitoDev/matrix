import { describe, expect, it } from "vitest";
import { getPaginationItems } from "./pagination-items";

describe("getPaginationItems", () => {
  it.each([
    { totalPages: 0, expected: [] },
    { totalPages: 1, expected: [1] },
    { totalPages: 3, expected: [1, 2, 3] },
    { totalPages: 7, expected: [1, 2, 3, 4, 5, 6, 7] },
  ])("muestra todas las páginas para un total de $totalPages", ({ totalPages, expected }) => {
    expect(getPaginationItems(1, totalPages)).toEqual(expected);
  });

  it.each([
    { currentPage: 1, expected: [1, 2, 3, 4, 5, "ellipsis-end", 20] },
    { currentPage: 4, expected: [1, 2, 3, 4, 5, "ellipsis-end", 20] },
    { currentPage: 5, expected: [1, "ellipsis-start", 4, 5, 6, "ellipsis-end", 20] },
    { currentPage: 10, expected: [1, "ellipsis-start", 9, 10, 11, "ellipsis-end", 20] },
    { currentPage: 16, expected: [1, "ellipsis-start", 15, 16, 17, "ellipsis-end", 20] },
    { currentPage: 17, expected: [1, "ellipsis-start", 16, 17, 18, 19, 20] },
    { currentPage: 20, expected: [1, "ellipsis-start", 16, 17, 18, 19, 20] },
  ])("abrevia los saltos desde la página $currentPage", ({ currentPage, expected }) => {
    expect(getPaginationItems(currentPage, 20)).toEqual(expected);
  });

  it.each([8, 9, 30])("incluye los extremos y la página activa sin duplicados cuando hay %i páginas", (totalPages) => {
    for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
      const items = getPaginationItems(currentPage, totalPages);
      const pages = items.filter((item) => typeof item === "number");

      expect(items).toHaveLength(7);
      expect(pages).toContain(currentPage);
      expect(pages[0]).toBe(1);
      expect(pages.at(-1)).toBe(totalPages);
      expect(new Set(pages).size).toBe(pages.length);
      expect(pages).toEqual([...pages].sort((first, second) => first - second));
    }
  });

  it("mantiene la lista acotada aunque existan un millón de páginas", () => {
    expect(getPaginationItems(500000, 1000000)).toEqual([
      1, "ellipsis-start", 499999, 500000, 500001, "ellipsis-end", 1000000,
    ]);
  });
});
