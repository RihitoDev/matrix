import { describe, expect, it } from "vitest";
import { isCvFileRejection } from "./is-cv-file-rejection";

describe("isCvFileRejection", () => {
  it.each([400, 413, 415, 422])("treats the status %i as a rejection of the file", (status) => {
    expect(isCvFileRejection({ response: { status } })).toBe(true);
  });

  it.each([401, 404, 500, 503])("does not treat the status %i as a rejection of the file", (status) => {
    expect(isCvFileRejection({ response: { status } })).toBe(false);
  });

  it("does not treat a network error without response as a rejection of the file", () => {
    expect(isCvFileRejection(new Error("Network Error"))).toBe(false);
  });

  it("does not treat a missing error as a rejection of the file", () => {
    expect(isCvFileRejection(undefined)).toBe(false);
  });
});
