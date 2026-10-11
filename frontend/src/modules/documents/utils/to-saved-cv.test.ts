import { describe, expect, it } from "vitest";
import { toSavedCv } from "./to-saved-cv";

describe("toSavedCv", () => {
  it("maps the api response to the saved cv shown in the card", () => {
    expect(
      toSavedCv({
        fileName: "CV-Test-User.pdf",
        fileType: "application/pdf",
        sizeInBytes: 1258291,
        updatedAt: "2026-10-03T12:00:00.000Z",
      }),
    ).toEqual({
      fileName: "CV-Test-User.pdf",
      fileType: "PDF",
      sizeInBytes: 1258291,
      updatedAt: new Date("2026-10-03T12:00:00.000Z"),
    });
  });
});
