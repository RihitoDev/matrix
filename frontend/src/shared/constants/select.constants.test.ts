import { describe, expect, it } from "vitest";
import { SELECT_ITEM_CONTRAST_CLASS, SELECT_POPUP_WIDE_CLASS } from "./select.constants";

describe("constantes de Select", () => {
  it("el ítem resaltado fija texto tinta en el ítem y en sus descendientes, sin el blanco del tema", () => {
    expect(SELECT_ITEM_CONTRAST_CLASS).toContain("focus:bg-surface-soft");
    expect(SELECT_ITEM_CONTRAST_CLASS).toContain("focus:text-ink");
    expect(SELECT_ITEM_CONTRAST_CLASS).toContain("not-data-[variant=destructive]:focus:**:text-ink");
    expect(SELECT_ITEM_CONTRAST_CLASS).not.toContain("accent-foreground");
  });

  it("el popup ancho crece con sus opciones y no baja del ancho del botón ni se sale de la pantalla", () => {
    expect(SELECT_POPUP_WIDE_CLASS).toContain("w-max");
    expect(SELECT_POPUP_WIDE_CLASS).toContain("min-w-(--anchor-width)");
    expect(SELECT_POPUP_WIDE_CLASS).toContain("max-w-[calc(100vw-1rem)]");
  });
});
