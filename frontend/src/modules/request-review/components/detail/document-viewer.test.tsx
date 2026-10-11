import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DocumentViewer } from "./document-viewer";

describe("DocumentViewer", () => {
  afterEach(() => cleanup());

  it("muestra una imagen con zoom y rotación por CSS", () => {
    render(<DocumentViewer url="blob:img" mimeType="image/png" fileName="titulo.png" />);
    const image = screen.getByAltText("Documento de respaldo");

    expect(image).toHaveStyle({ transform: "scale(1) rotate(0deg)" });
    fireEvent.click(screen.getByRole("button", { name: "Acercar" }));
    expect(image).toHaveStyle({ transform: "scale(1.25) rotate(0deg)" });
    expect(screen.getByText("125 %")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Alejar" }));
    fireEvent.click(screen.getByRole("button", { name: "Alejar" }));
    expect(image).toHaveStyle({ transform: "scale(0.75) rotate(0deg)" });
    fireEvent.click(screen.getByRole("button", { name: "Rotar" }));
    expect(image).toHaveStyle({ transform: "scale(0.75) rotate(90deg)" });
  });

  it("limita el zoom entre 50 % y 300 %", () => {
    render(<DocumentViewer url="blob:img" mimeType="image/jpeg" fileName="a.jpg" />);
    for (let i = 0; i < 10; i++) fireEvent.click(screen.getByRole("button", { name: "Acercar" }));
    expect(screen.getByText("300 %")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Acercar" })).toBeDisabled();
    for (let i = 0; i < 12; i++) fireEvent.click(screen.getByRole("button", { name: "Alejar" }));
    expect(screen.getByText("50 %")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Alejar" })).toBeDisabled();
  });

  it("rota de 90 en 90 y vuelve a 0 tras cuatro giros", () => {
    render(<DocumentViewer url="blob:img" mimeType="image/png" fileName="a.png" />);
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole("button", { name: "Rotar" }));
    expect(screen.getByAltText("Documento de respaldo")).toHaveStyle({ transform: "scale(1) rotate(0deg)" });
  });

  it("un PDF se muestra en el visor del navegador, sin herramientas de imagen", () => {
    render(<DocumentViewer url="blob:pdf" mimeType="application/pdf" fileName="titulo.pdf" />);

    expect(screen.getByTitle("Documento de respaldo")).toHaveAttribute("src", "blob:pdf#toolbar=0&navpanes=0&view=FitH");
    expect(screen.queryByRole("button", { name: "Acercar" })).toBeNull();
  });

  it("permite descargar el documento con su nombre", () => {
    render(<DocumentViewer url="blob:pdf" mimeType="application/pdf" fileName="titulo.pdf" />);
    const link = screen.getByRole("link", { name: /Descargar/ });
    expect(link).toHaveAttribute("href", "blob:pdf");
    expect(link).toHaveAttribute("download", "titulo.pdf");
  });

  it("Descargar es un enlace real (no un botón) y no emite el aviso de Base UI", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(<DocumentViewer url="blob:img" mimeType="image/png" fileName="titulo.png" />);

    const link = screen.getByRole("link", { name: /Descargar/ });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "blob:img");
    expect(link).toHaveAttribute("download", "titulo.png");
    expect(screen.queryByRole("button", { name: /Descargar/ })).toBeNull();
    expect(consoleError.mock.calls.flat().join(" ")).not.toContain("nativeButton");
    consoleError.mockRestore();
  });

  it("muestra el nombre del archivo en la barra, los iconos de herramientas y la nota al pie", () => {
    render(<DocumentViewer url="blob:img" mimeType="image/png" fileName="diploma.png" caption="Documento: Diploma académico" />);

    expect(screen.getByText("diploma.png")).toBeInTheDocument();
    expect(screen.getByRole("toolbar", { name: "Herramientas del documento" })).toBeInTheDocument();
    expect(screen.getByText("Documento: Diploma académico")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Descargar" })).toHaveAttribute("download", "diploma.png");
  });

  it("sin nota al pie no la muestra", () => {
    render(<DocumentViewer url="blob:img" mimeType="image/png" fileName="diploma.png" />);
    expect(screen.queryByText(/Documento:/)).toBeNull();
  });
});
