import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReplaceCvDialog } from "./replace-cv-dialog";

function createPdf(): File {
  return new File([new Uint8Array(1258291)], "CV_Nuevo.pdf", { type: "application/pdf" });
}

function renderDialog(props: Partial<Parameters<typeof ReplaceCvDialog>[0]> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ReplaceCvDialog
      file={createPdf()}
      currentFileName="CV_Valeria_Quispe.pdf"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  );
  return { onConfirm, onCancel, user: userEvent.setup() };
}

describe("ReplaceCvDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the current cv and the name and size of the selected file", async () => {
    renderDialog();

    const dialog = await screen.findByRole("alertdialog", { name: "¿Reemplazar tu CV?" });

    expect(dialog).toHaveAccessibleDescription(
      "Se reemplazará CV_Valeria_Quispe.pdf por el archivo seleccionado. El archivo anterior se eliminará.",
    );
    expect(screen.getByText("CV_Nuevo.pdf · 1.2 MB")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("uses a generic description when the current file name is missing or blank", async () => {
    renderDialog({ currentFileName: "   " });

    expect(await screen.findByRole("alertdialog")).toHaveAccessibleDescription(
      "Se reemplazará tu CV actual por el archivo seleccionado. El archivo anterior se eliminará.",
    );
  });

  it("is closed when there is no selected file", () => {
    renderDialog({ file: null, currentFileName: undefined });

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("confirms the replacement with the selected file", async () => {
    const file = createPdf();
    const { onConfirm, user } = renderDialog({ file });

    await user.click(await screen.findByRole("button", { name: "Reemplazar" }));

    expect(onConfirm).toHaveBeenCalledWith(file);
  });

  it("cancels the replacement", async () => {
    const { onCancel, onConfirm, user } = renderDialog();

    await user.click(await screen.findByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("shows the spinner and disables both actions while replacing", async () => {
    renderDialog({ isReplacing: true });

    const replacingButton = await screen.findByRole("button", { name: "Reemplazando..." });

    expect(replacingButton).toBeDisabled();
    expect(replacingButton.querySelector("svg.lucide-loader-circle")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });

  it("shows the error message inside the dialog", async () => {
    renderDialog({ errorMessage: "No se pudo subir tu CV. Intenta de nuevo." });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo subir tu CV. Intenta de nuevo.",
    );
  });
});
