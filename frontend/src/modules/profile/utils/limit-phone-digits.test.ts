import { describe, expect, it } from "vitest";
import { limitPhoneDigits } from "./limit-phone-digits";

describe("limitPhoneDigits", () => {
  it("keeps a phone with 15 digits or less unchanged", () => {
    expect(limitPhoneDigits("+591 700-00000")).toBe("+591 700-00000");
    expect(limitPhoneDigits("123456789012345")).toBe("123456789012345");
  });

  it("drops the digits after the fifteenth", () => {
    expect(limitPhoneDigits("1234567890123456789")).toBe("123456789012345");
  });

  it("does not count spaces, hyphens or the plus sign as digits", () => {
    expect(limitPhoneDigits("+591 7000-0000-0000 99")).toBe("+591 7000-0000-0000 ");
  });

  it("returns an empty text for an empty value", () => {
    expect(limitPhoneDigits("")).toBe("");
  });
});
