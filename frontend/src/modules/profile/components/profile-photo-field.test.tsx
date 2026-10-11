import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProfilePhotoField } from "./profile-photo-field";

describe("ProfilePhotoField", () => {
  afterEach(() => {
    cleanup();
  });

  it("disables the upload button when there is no handler", () => {
    render(<ProfilePhotoField />);

    expect(screen.getByText("Foto")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Subir fotografía" })).toBeDisabled();
  });

  it("sends the selected file to the handler", async () => {
    const onSelectPhoto = vi.fn();
    const user = userEvent.setup();
    render(<ProfilePhotoField onSelectPhoto={onSelectPhoto} />);
    const photo = new File(["photo"], "photo.png", { type: "image/png" });

    await user.upload(screen.getByLabelText("Seleccionar fotografía de perfil"), photo);

    expect(onSelectPhoto).toHaveBeenCalledWith(photo);
  });

  it("opens the file picker from the upload button", async () => {
    const user = userEvent.setup();
    render(<ProfilePhotoField onSelectPhoto={vi.fn()} />);
    const input = screen.getByLabelText<HTMLInputElement>("Seleccionar fotografía de perfil");
    const clickSpy = vi.spyOn(input, "click");

    await user.click(screen.getByRole("button", { name: "Subir fotografía" }));

    expect(clickSpy).toHaveBeenCalled();
  });

  it("shows the preview with save and cancel actions", async () => {
    const onConfirmPhoto = vi.fn();
    const onCancelPhoto = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <ProfilePhotoField
        photoUrl="blob:saved"
        previewUrl="blob:preview"
        onSelectPhoto={vi.fn()}
        onConfirmPhoto={onConfirmPhoto}
        onCancelPhoto={onCancelPhoto}
      />,
    );

    expect(container.querySelector("img")).toHaveAttribute("src", "blob:preview");
    expect(screen.getByText(/Vista previa/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Guardar fotografía" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onConfirmPhoto).toHaveBeenCalledTimes(1);
    expect(onCancelPhoto).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Eliminar fotografía" })).not.toBeInTheDocument();
  });

  it("shows the saved photo with change and delete actions", () => {
    const { container } = render(
      <ProfilePhotoField photoUrl="blob:photo" onSelectPhoto={vi.fn()} onDeletePhoto={vi.fn()} />,
    );

    expect(container.querySelector("img")).toHaveAttribute("src", "blob:photo");
    expect(screen.queryByText("Foto")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cambiar fotografía" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Eliminar fotografía" })).toBeEnabled();
  });

  it("asks for confirmation before deleting the photo", async () => {
    const onDeletePhoto = vi.fn();
    const user = userEvent.setup();
    render(
      <ProfilePhotoField
        photoUrl="blob:photo"
        onSelectPhoto={vi.fn()}
        onDeletePhoto={onDeletePhoto}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Eliminar fotografía" }));
    expect(await screen.findByText("¿Eliminar tu fotografía?")).toBeInTheDocument();
    expect(onDeletePhoto).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(onDeletePhoto).toHaveBeenCalledTimes(1);
  });

  it("keeps the photo when the deletion is cancelled", async () => {
    const onDeletePhoto = vi.fn();
    const user = userEvent.setup();
    render(
      <ProfilePhotoField
        photoUrl="blob:photo"
        onSelectPhoto={vi.fn()}
        onDeletePhoto={onDeletePhoto}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Eliminar fotografía" }));
    await user.click(await screen.findByRole("button", { name: "Cancelar" }));

    expect(onDeletePhoto).not.toHaveBeenCalled();
  });

  it("disables every action while the photo is uploading", () => {
    render(
      <ProfilePhotoField
        previewUrl="blob:preview"
        isUploading
        onSelectPhoto={vi.fn()}
        onConfirmPhoto={vi.fn()}
        onCancelPhoto={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });

  it("shows the photo error", () => {
    render(
      <ProfilePhotoField
        error="La fotografía debe estar en formato JPG o PNG."
        onSelectPhoto={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "La fotografía debe estar en formato JPG o PNG.",
    );
  });
});
