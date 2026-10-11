import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReviewListItem } from "../../types/request-review.types";
import { RequestTable } from "./request-table";

const item: ReviewListItem = {
  id: "id-1",
  requestCode: "SOL-2026-0001",
  fullName: "Ana Pérez",
  email: "ana@umss.test",
  sisCode: "2018001",
  documentType: "academic_diploma",
  submittedAt: new Date(Date.now() - 2 * 3_600_000).toISOString(),
  status: "in_review",
};

describe("RequestTable", () => {
  afterEach(() => cleanup());

  it("muestra las columnas del mockup y el botón Revisar con su enlace", () => {
    render(<RequestTable items={[item]} />);

    for (const header of ["Solicitante", "Código SIS", "Documento", "Enviada", "Estado", "Acción"]) {
      expect(screen.getByRole("columnheader", { name: header })).toBeInTheDocument();
    }
    expect(screen.getByText("Ana Pérez")).toBeInTheDocument();
    expect(screen.getByText("ana@umss.test")).toBeInTheDocument();
    expect(screen.getByText("2018001")).toBeInTheDocument();
    expect(screen.getByText("Diploma académico")).toBeInTheDocument();
    expect(screen.getByText("hace 2 h")).toBeInTheDocument();
    expect(screen.getByText("En revisión")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Revisar" })).toHaveAttribute("href", "/backoffice/solicitudes/id-1");
  });

  it("muestra el estado como texto y tolera un documento ausente o desconocido", () => {
    render(
      <RequestTable
        items={[
          { ...item, id: "2", documentType: null, status: "rejected" },
          { ...item, id: "3", documentType: "otro_tipo", status: "approved" },
        ]}
      />,
    );

    expect(screen.getByText("Sin documento")).toBeInTheDocument();
    expect(screen.getByText("otro_tipo")).toBeInTheDocument();
    expect(screen.getByText("Rechazada")).toBeInTheDocument();
    expect(screen.getByText("Aprobada")).toBeInTheDocument();
  });

  it("muestra filas de esqueleto mientras carga", () => {
    render(<RequestTable isLoading />);
    expect(screen.getAllByTestId("request-skeleton-row")).toHaveLength(5);
  });

  it("sin datos renderiza solo los encabezados", () => {
    render(<RequestTable />);
    expect(screen.queryByRole("link", { name: "Revisar" })).toBeNull();
  });

  it("Revisar es un enlace real (no un botón) y no emite el aviso de Base UI", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(<RequestTable items={[item]} />);

    const link = screen.getByRole("link", { name: "Revisar" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/backoffice/solicitudes/id-1");
    expect(screen.queryByRole("button", { name: "Revisar" })).toBeNull();
    expect(consoleError.mock.calls.flat().join(" ")).not.toContain("nativeButton");
    consoleError.mockRestore();
  });

  it("muestra las iniciales en un círculo decorativo y el estado como pastilla legible por su texto", () => {
    const { container } = render(<RequestTable items={[item, { ...item, id: "2", fullName: "María Quispe Mamani", status: "approved" }]} />);

    expect(screen.getByText("AP")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("MQ")).toBeInTheDocument();
    expect(screen.getByText("En revisión").className).toContain("rounded-full");
    expect(screen.getByText("Aprobada")).toBeInTheDocument();
    expect(container.querySelectorAll("svg[aria-hidden='true']").length).toBeGreaterThanOrEqual(4);
    expect(container.innerHTML).not.toMatch(/(green|amber|red|yellow)-\d/);
  });

  it("Revisar es un botón de contorno de 34 px, el avatar es claro con borde y los encabezados son grises", () => {
    render(<RequestTable items={[item]} />);

    expect(screen.getByRole("link", { name: "Revisar" })).toHaveClass("h-[34px]", "bg-surface", "font-semibold", "border-border");
    expect(screen.getByText("AP")).toHaveClass("bg-surface-soft", "border", "font-bold", "text-ink");
    expect(screen.getByRole("columnheader", { name: "Solicitante" })).toHaveClass("text-text-secondary", "font-semibold");
    expect(screen.getByText("En revisión")).toHaveClass("bg-surface-soft", "border-ink");
  });
});
