import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SavedCv } from "../types/saved-cv.types";
import { SavedCvCard } from "./saved-cv-card";

const SAVED_CV: SavedCv = {
  fileName: "CV_Valeria_Quispe.pdf",
  fileType: "PDF",
  sizeInBytes: 1258291,
  updatedAt: new Date(2026, 8, 20),
};

describe("SavedCvCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the empty state without a saved cv", () => {
    render(<SavedCvCard savedCv={null} onReplace={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText("Archivo guardado")).toBeInTheDocument();
    expect(
      screen.getByText("Al confirmar la carga, el archivo se mostrará aquí."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reemplazar CV" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Eliminar CV" })).not.toBeInTheDocument();
    expect(screen.queryByText("Cargado correctamente")).not.toBeInTheDocument();
  });

  it("shows the name, type, size and update date of the saved cv", () => {
    render(<SavedCvCard savedCv={SAVED_CV} onReplace={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText("CV_Valeria_Quispe.pdf")).toBeInTheDocument();
    expect(screen.getByText("PDF · 1.2 MB · Actualizado el 20 sep 2026")).toBeInTheDocument();
    expect(
      screen.queryByText("Al confirmar la carga, el archivo se mostrará aquí."),
    ).not.toBeInTheDocument();
  });

  it("shows the uploaded indicator with the lucide check icon", () => {
    render(<SavedCvCard savedCv={SAVED_CV} onReplace={vi.fn()} onDelete={vi.fn()} />);

    const indicator = screen.getByText("Cargado correctamente");

    expect(indicator).toHaveTextContent(/^Cargado correctamente$/);
    expect(indicator.querySelector("svg.lucide-check")).toBeInTheDocument();
  });

  it("calls the replace and delete actions", async () => {
    const user = userEvent.setup();
    const onReplace = vi.fn();
    const onDelete = vi.fn();
    render(<SavedCvCard savedCv={SAVED_CV} onReplace={onReplace} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "Reemplazar CV" }));
    await user.click(screen.getByRole("button", { name: "Eliminar CV" }));

    expect(onReplace).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("shows a loading placeholder instead of the empty state while the cv loads", () => {
    render(
      <SavedCvCard savedCv={null} isLoading onReplace={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByText("Cargando tu CV...")).toBeInTheDocument();
    expect(
      screen.queryByText("Al confirmar la carga, el archivo se mostrará aquí."),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reemplazar CV" })).not.toBeInTheDocument();
  });

  it("disables the actions while busy", () => {
    render(<SavedCvCard savedCv={SAVED_CV} isBusy onReplace={vi.fn()} onDelete={vi.fn()} />);

    const replaceButton = screen.getByRole("button", { name: "Reemplazar CV" });
    const deleteButton = screen.getByRole("button", { name: "Eliminar CV" });

    expect(replaceButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });
});
