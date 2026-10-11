import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ReviewDetail } from "../../types/request-review.types";
import { DataContrastPanel } from "./data-contrast-panel";

export const detail: ReviewDetail = {
  id: "id-1",
  requestCode: "SOL-2026-0001",
  status: "in_review",
  firstName: "José Luis",
  lastName: "Pérez",
  idCardNumber: "1234567",
  idCardIssuedIn: "CB",
  sisCode: "2018001",
  email: "jose@umss.test",
  phone: null,
  birthDate: "2000-05-10",
  graduationYear: 2022,
  career: "Licenciatura en Ingeniería de Sistemas",
  document: { type: "academic_diploma", name: "diploma", extension: "pdf", mimeType: "application/pdf", size: 1024 },
  history: { submittedAt: null, reviewedAt: null, reviewedBy: null, rejectionReason: null },
};

describe("DataContrastPanel", () => {
  afterEach(() => cleanup());

  it("muestra cada campo declarado junto a su campo del documento, por verificar al inicio", () => {
    render(<DataContrastPanel detail={detail} />);

    for (const label of ["Nombres", "Apellidos", "Carnet de identidad", "Código SIS", "Carrera", "Año de titulación"]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByText("José Luis")).toBeInTheDocument();
    expect(screen.getAllByText("Por verificar")).toHaveLength(6);
    expect(screen.getByText("0 coinciden")).toBeInTheDocument();
    expect(screen.getByText("6 por verificar")).toBeInTheDocument();
  });

  it("marca Coincide cuando el valor del documento coincide y actualiza el resumen", () => {
    render(<DataContrastPanel detail={detail} />);

    fireEvent.change(screen.getByLabelText("Nombres"), { target: { value: "jose luis" } });
    expect(screen.getAllByText("Coincide")).toHaveLength(1);
    expect(screen.getByText("1 coinciden")).toBeInTheDocument();
    expect(screen.getByText("5 por verificar")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Código SIS"), { target: { value: "2018001" } });
    expect(screen.getByText("2 coinciden")).toBeInTheDocument();
    expect(screen.getByText("4 por verificar")).toBeInTheDocument();
  });

  it("un valor distinto sigue por verificar", () => {
    render(<DataContrastPanel detail={detail} />);
    fireEvent.change(screen.getByLabelText("Carnet de identidad"), { target: { value: "7654321" } });
    expect(screen.queryByText("Coincide")).toBeNull();
  });
});
