import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConfirmDiscardDialog } from "./confirm-discard-dialog";

afterEach(() => {
  cleanup();
});

describe("ConfirmDiscardDialog", () => {
  it("muestra el nombre del candidato y las acciones cuando está abierto", async () => {
    render(
      <ConfirmDiscardDialog
        open
        candidateName="Carlos Mendoza Ríos"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("Descartar perfil")).toBeInTheDocument();
    expect(screen.getByText(/Carlos Mendoza Ríos/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sí, descartar" })).toBeInTheDocument();
  });

  it("no renderiza el diálogo cuando está cerrado", () => {
    render(
      <ConfirmDiscardDialog
        open={false}
        candidateName="Carlos Mendoza Ríos"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("llama a onConfirm al confirmar el descarte", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ConfirmDiscardDialog
        open
        candidateName="Carlos Mendoza Ríos"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );

    await user.click(await screen.findByRole("button", { name: "Sí, descartar" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("llama a onCancel al cancelar", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <ConfirmDiscardDialog
        open
        candidateName="Carlos Mendoza Ríos"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );

    await user.click(await screen.findByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalled();
  });
});
