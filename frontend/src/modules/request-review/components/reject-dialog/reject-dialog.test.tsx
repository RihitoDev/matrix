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

  it("la indicación parte las palabras largas para no desbordar el diálogo", async () => {
    render(<RejectDialog detail={detail} open onOpenChange={vi.fn()} onRejected={vi.fn()} />);

    const hint = await screen.findByLabelText("Indicación para el solicitante");
    expect(hint).toHaveClass("max-w-full", "[overflow-wrap:anywhere]");
  });

  it("el contador cuenta solo la indicación: 0/500 vacío y sin sumar el motivo elegido", async () => {
    render(<RejectDialog detail={detail} open onOpenChange={vi.fn()} onRejected={vi.fn()} />);
    expect(await screen.findByText("0/500")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Documento ilegible"));
    expect(screen.getByText("0/480")).toBeInTheDocument();
    expect(screen.getByText("El motivo elegido ocupa 20 de los 500 caracteres del mensaje.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Indicación para el solicitante"), { target: { value: "Sube el PDF original." } });
    expect(screen.getByText("21/480")).toBeInTheDocument();
  });

  it("al superar el límite del mensaje muestra el aviso de la indicación y bloquea el envío", async () => {
    render(<RejectDialog detail={detail} open onOpenChange={vi.fn()} onRejected={vi.fn()} />);
    await screen.findByText("0/500");

    fireEvent.click(screen.getByText("Documento ilegible"));
    fireEvent.change(screen.getByLabelText("Indicación para el solicitante"), { target: { value: "a".repeat(481) } });

    expect(screen.getByRole("alert")).toHaveTextContent("La indicación no puede superar los 480 caracteres");
    expect(screen.queryByText(/El motivo no puede superar/)).toBeNull();
    expect(screen.getByRole("button", { name: "Rechazar y notificar" })).toBeDisabled();
  });
});
