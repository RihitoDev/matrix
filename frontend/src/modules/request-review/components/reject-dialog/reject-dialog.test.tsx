import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { detail } from "../detail/data-contrast-panel.test";
import { RejectDialog } from "./reject-dialog";

describe("RejectDialog: estilo", () => {
  afterEach(() => cleanup());

  it("Cancelar es de contorno (fondo blanco y borde) y los motivos miden 15 px", async () => {
    const onOpenChange = vi.fn();
    render(<RejectDialog detail={detail} open onOpenChange={onOpenChange} onRejected={vi.fn()} />);

    const cancel = await screen.findByRole("button", { name: "Cancelar" });
    expect(cancel).toHaveClass("bg-surface", "border", "border-border");
    expect(screen.getByText("Documento ilegible").closest("label")).toHaveClass("text-[15px]");
    fireEvent.click(cancel);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
