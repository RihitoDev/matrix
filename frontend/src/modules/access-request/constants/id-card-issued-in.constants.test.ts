import { describe, expect, it } from "vitest";
import { ID_CARD_ISSUED_IN } from "./id-card-issued-in.constants";

describe("ID_CARD_ISSUED_IN", () => {
  it("lista los 9 códigos de expedición en el orden del backend", () => {
    expect(ID_CARD_ISSUED_IN).toEqual(["CB", "LP", "SC", "OR", "PT", "CH", "TJ", "BE", "PD"]);
  });
});
