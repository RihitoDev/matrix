import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Certification } from "../types/certification.types";
import type { UploadedDocumentInfo } from "@/modules/profile/types/uploaded-document-info.types";
import { CertificationDocumentItem } from "./certification-document-item";

const CERTIFICATION: Certification = {
  id: "scrum",
  name: "Scrum Master",
  issuingOrganization: "Scrum Alliance",
  issueDate: "2025-01-01",
  hasDocument: true,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};
const INFO: UploadedDocumentInfo = {
  fileName: "scrum_fundamentals.pdf",
  format: "PDF",
  uploadedAt: "4 oct 2026",
};

function renderItem(info?: UploadedDocumentInfo, isBusy = false) {
  const onView = vi.fn();
  const onReplace = vi.fn();
  const onRemove = vi.fn();
  render(
    <CertificationDocumentItem
      certification={CERTIFICATION}
      info={info}
      isBusy={isBusy}
      onView={onView}
      onReplace={onReplace}
      onRemove={onRemove}
    />,
  );
  return { onView, onReplace, onRemove, user: userEvent.setup() };
}

describe("CertificationDocumentItem", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the file name and the format, date and certification", () => {
    renderItem(INFO);

    expect(screen.getByRole("button", { name: "Ver documento de Scrum Master" })).toHaveTextContent(
      "scrum_fundamentals.pdf",
    );
    expect(screen.getByText("PDF · 4 oct 2026 · Scrum Master")).toBeInTheDocument();
  });

  it("falls back to the certification name when the file details are unknown", () => {
    renderItem();

    expect(screen.getByRole("button", { name: "Ver documento de Scrum Master" })).toHaveTextContent(
      "Documento de respaldo",
    );
    expect(screen.getByText("Scrum Master")).toBeInTheDocument();
  });

  it("notifies the view, replace and remove actions", async () => {
    const { onView, onReplace, onRemove, user } = renderItem(INFO);

    await user.click(screen.getByRole("button", { name: "Ver documento de Scrum Master" }));
    await user.click(screen.getByRole("button", { name: "Reemplazar documento de Scrum Master" }));
    await user.click(screen.getByRole("button", { name: "Eliminar documento de Scrum Master" }));

    expect(onView).toHaveBeenCalledWith(CERTIFICATION);
    expect(onReplace).toHaveBeenCalledWith(CERTIFICATION);
    expect(onRemove).toHaveBeenCalledWith(CERTIFICATION);
  });

  it("disables the actions while busy", () => {
    renderItem(INFO, true);

    expect(screen.getByRole("button", { name: "Ver documento de Scrum Master" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Reemplazar documento de Scrum Master" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Eliminar documento de Scrum Master" })).toBeDisabled();
  });
});
