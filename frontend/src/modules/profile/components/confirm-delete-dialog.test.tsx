import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";

const DIALOG_TITLE = "¿Eliminar el archivo?";
const DIALOG_MESSAGE = "Esta acción no se puede deshacer.";

function renderDialog(isOpen = true, isDeleting = false) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ConfirmDeleteDialog
      isOpen={isOpen}
      title={DIALOG_TITLE}
      message={DIALOG_MESSAGE}
      isDeleting={isDeleting}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  );
  return { onConfirm, onCancel, user: userEvent.setup() };
}

function DeleteFlowHarness() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasFile, setHasFile] = useState(true);

  return (
    <>
      <p>{hasFile ? "CV_Valeria_Quispe.pdf" : "Sin archivo"}</p>
      <button type="button" onClick={() => setIsOpen(true)}>
        Eliminar CV
      </button>
      <ConfirmDeleteDialog
        isOpen={isOpen}
        title="¿Eliminar tu CV?"
        message="El archivo dejará de estar disponible en tu perfil."
        onConfirm={() => {
          setHasFile(false);
          setIsOpen(false);
        }}
        onCancel={() => setIsOpen(false)}
      />
    </>
  );
}

describe("ConfirmDeleteDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("does not render the dialog when it is closed", () => {
    renderDialog(false);

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("shows the title and the message when it is open", async () => {
    renderDialog();

    const dialog = await screen.findByRole("alertdialog", { name: DIALOG_TITLE });

    expect(dialog).toHaveAccessibleDescription(DIALOG_MESSAGE);
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Eliminar" })).toBeEnabled();
  });

  it("calls onConfirm when confirming", async () => {
    const { onConfirm, onCancel, user } = renderDialog();

    await user.click(await screen.findByRole("button", { name: "Eliminar" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("calls onCancel when cancelling without confirming", async () => {
    const { onConfirm, onCancel, user } = renderDialog();

    await user.click(await screen.findByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("calls onCancel when pressing Escape", async () => {
    const { onConfirm, onCancel, user } = renderDialog();

    await screen.findByRole("alertdialog");
    await user.keyboard("{Escape}");

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("disables the actions and shows the progress while deleting", async () => {
    const { onCancel, user } = renderDialog(true, true);

    const confirmButton = await screen.findByRole("button", { name: "Eliminando..." });

    expect(confirmButton).toBeDisabled();
    expect(confirmButton.querySelector("svg.lucide-loader-circle")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Eliminar" })).not.toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("opens from a trigger, closes after confirming and keeps the item after cancelling", async () => {
    const user = userEvent.setup();
    render(<DeleteFlowHarness />);

    await user.click(screen.getByRole("button", { name: "Eliminar CV" }));
    await user.click(await screen.findByRole("button", { name: "Cancelar" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(screen.getByText("CV_Valeria_Quispe.pdf")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Eliminar CV" }));
    await user.click(await screen.findByRole("button", { name: "Eliminar" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(screen.getByText("Sin archivo")).toBeInTheDocument();
  });
});
