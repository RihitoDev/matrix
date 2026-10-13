import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Certification } from "../types/certification.types";
import { CertificationDocumentsPanel } from "./certification-documents-panel";

function createCertification(id: string, name: string, hasDocument: boolean): Certification {
  return {
    id,
    name,
    issuingOrganization: "Scrum Alliance",
    issueDate: "2025-01-01",
    hasDocument,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  };
}

const SCRUM = createCertification("scrum", "Scrum Master", true);
const AWS = createCertification("aws", "AWS Cloud Practitioner", false);

function renderPanel({
  certifications = [SCRUM, AWS],
  isBusy = false,
  form,
}: {
  certifications?: Certification[];
  isBusy?: boolean;
  form?: React.ReactNode;
} = {}) {
  const onView = vi.fn();
  render(
    <CertificationDocumentsPanel
      certifications={certifications}
      uploadedInfo={{ scrum: { fileName: "scrum_fundamentals.pdf", format: "PDF", uploadedAt: "4 oct 2026" } }}
      isBusy={isBusy}
      form={form}
      onView={onView}
    />,
  );
  return { onView, user: userEvent.setup() };
}

describe("CertificationDocumentsPanel", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows only the title and the empty message when there are no documents", () => {
    renderPanel({ certifications: [] });

    expect(
      screen.getByText("Documentos de respaldo", { selector: "[data-slot=card-title]" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Aún no has cargado documentos de respaldo.")).toBeInTheDocument();
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("lists only the certifications that have a document", () => {
    renderPanel();

    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    expect(
      within(list).getByRole("button", { name: "Ver documento de Scrum Master" }),
    ).toHaveTextContent("scrum_fundamentals.pdf");
  });

  it("does not offer upload, replace or remove actions in the list", () => {
    renderPanel();

    expect(screen.queryByRole("button", { name: /Reemplazar/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Eliminar/ })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Archivo de reemplazo")).not.toBeInTheDocument();
  });

  it("opens the document", async () => {
    const { onView, user } = renderPanel();

    await user.click(screen.getByRole("button", { name: "Ver documento de Scrum Master" }));

    expect(onView).toHaveBeenCalledWith(SCRUM);
  });

  it("renders the form above the list when provided", () => {
    renderPanel({ form: <form aria-label="Agregar certificación" /> });

    const form = screen.getByRole("form", { name: "Agregar certificación" });
    const list = screen.getByRole("list");

    expect(form.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(form.parentElement).toHaveClass("animate-in", "duration-300");
  });

  it("disables the document actions while busy", () => {
    renderPanel({ isBusy: true });

    expect(screen.getByRole("button", { name: "Ver documento de Scrum Master" })).toBeDisabled();
  });
});
