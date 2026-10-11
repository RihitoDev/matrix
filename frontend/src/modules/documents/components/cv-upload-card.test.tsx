import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CvUploadCard } from "./cv-upload-card";

function createPdf(): File {
  return new File([new Uint8Array(1258291)], "CV_Valeria_Quispe.pdf", { type: "application/pdf" });
}

function renderCard(selectedFile: File | null = null, isUploading = false, isBusy = false) {
  const onSelectFile = vi.fn();
  const onConfirmUpload = vi.fn();
  render(
    <CvUploadCard
      selectedFile={selectedFile}
      isUploading={isUploading}
      isBusy={isBusy}
      onSelectFile={onSelectFile}
      onConfirmUpload={onConfirmUpload}
    />,
  );
  return { onSelectFile, onConfirmUpload, user: userEvent.setup() };
}

describe("CvUploadCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the instructions and disables confirm without a selected file", () => {
    renderCard();

    expect(screen.getByText("Subir currículum")).toBeInTheDocument();
    expect(screen.getByText("Selecciona tu CV en formato PDF")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Seleccionar PDF" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Confirmar carga" })).toBeDisabled();
  });

  it("shows the name and size of the selected file", () => {
    renderCard(createPdf());

    expect(screen.getByText("CV_Valeria_Quispe.pdf · 1.2 MB")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar carga" })).toBeEnabled();
  });

  it("calls onSelectFile from Seleccionar PDF", async () => {
    const { onSelectFile, user } = renderCard();

    await user.click(screen.getByRole("button", { name: "Seleccionar PDF" }));

    expect(onSelectFile).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirmUpload with the selected file", async () => {
    const file = createPdf();
    const { onConfirmUpload, user } = renderCard(file);

    await user.click(screen.getByRole("button", { name: "Confirmar carga" }));

    expect(onConfirmUpload).toHaveBeenCalledWith(file);
  });

  it("shows the spinner and disables both buttons while uploading", () => {
    renderCard(createPdf(), true, true);

    const uploadingButton = screen.getByRole("button", { name: "Cargando..." });

    expect(uploadingButton).toBeDisabled();
    expect(uploadingButton.querySelector("svg.lucide-loader-circle")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Seleccionar PDF" })).toBeDisabled();
  });

  it("disables both buttons without the spinner while busy", () => {
    renderCard(createPdf(), false, true);

    const confirmButton = screen.getByRole("button", { name: "Confirmar carga" });

    expect(confirmButton).toBeDisabled();
    expect(confirmButton.querySelector("svg")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Seleccionar PDF" })).toBeDisabled();
  });
});
