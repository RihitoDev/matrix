import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ActivationConfirmDialog } from "./activation-confirm-dialog";

type ActivationConfirmDialogProps = Parameters<
  typeof ActivationConfirmDialog
>[0];

afterEach(() => {
  cleanup();
});

function renderDialog(props: Partial<ActivationConfirmDialogProps> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  render(
    <ActivationConfirmDialog
      open
      isActivating={false}
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  );

  return { onConfirm, onCancel };
}

describe("ActivationConfirmDialog", () => {
  it("shows the confirmation question and both actions when open", () => {
    renderDialog();

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(
      screen.getByText(
        "¿Está seguro de que desea activar su participación como mentor?",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aceptar" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cancelar" }),
    ).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    renderDialog({ open: false });

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("calls onConfirm once and not onCancel when accepting", () => {
    const { onConfirm, onCancel } = renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("calls onCancel once and not onConfirm when cancelling", () => {
    const { onConfirm, onCancel } = renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("calls onCancel when pressing Escape and it is not activating", () => {
    const { onConfirm, onCancel } = renderDialog();

    fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("disables both actions and shows Activando... while activating", () => {
    renderDialog({ isActivating: true });

    expect(screen.getByRole("button", { name: "Activando..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });

  it("does not call any callback while activating", () => {
    const { onConfirm, onCancel } = renderDialog({ isActivating: true });

    fireEvent.click(screen.getByRole("button", { name: "Activando..." }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });
});