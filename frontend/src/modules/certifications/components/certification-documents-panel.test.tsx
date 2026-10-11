import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FILE_VALIDATION_MESSAGES } from "@/modules/profile/config/file-validation-messages.config";
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
const CERTIFICATE_PDF = new File(["certificate"], "scrum_fundamentals.pdf", {
  type: "application/pdf",
});

import { useState } from "react";
import type { UploadedDocumentInfo } from "@/modules/profile/types/uploaded-document-info.types";
import { getFileFormat } from "../utils/get-file-format";
import { formatIssueDate } from "../utils/format-issue-date";
import { getTodayIsoDate } from "../utils/validate-certification";

function PanelTestWrapper(props: Parameters<typeof CertificationDocumentsPanel>[0]) {

  const [uploadedInfo, setUploadedInfo] = useState<Record<string, UploadedDocumentInfo>>({});

  const handleUpload = async (cert: Certification, file: File) => {
    const success = await props.onUpload(cert, file);
    if (success) {
      setUploadedInfo(prev => ({
        ...prev,
        [cert.id]: {
          fileName: file.name,
          format: getFileFormat(file.name),
          uploadedAt: formatIssueDate(getTodayIsoDate()),
        }
      }));
    }
    return success;
  };

  const handleRemove = async (cert: Certification) => {
    const success = await props.onRemove(cert);
    if (success) {
      setUploadedInfo(prev => {
        const next = { ...prev };
        delete next[cert.id];
        return next;
      });
    }
    return success;
  };

  return (
    <CertificationDocumentsPanel
      {...props}
      uploadedInfo={uploadedInfo}
      onUpload={handleUpload}
      onRemove={handleRemove}
    />
  );
}

function renderPanel({
  certifications = [SCRUM, AWS],
  isBusy = false,
  onUpload = vi.fn().mockResolvedValue(true),
  onRemove = vi.fn().mockResolvedValue(true),
}: {
  certifications?: Certification[];
  isBusy?: boolean;
  onUpload?: (certification: Certification, file: File) => boolean | Promise<boolean>;
  onRemove?: (certification: Certification) => boolean | Promise<boolean>;
} = {}) {
  const onView = vi.fn();
  const onInvalidFile = vi.fn();
  render(
    <PanelTestWrapper
      certifications={certifications}
      isBusy={isBusy}
      onUpload={onUpload}
      onRemove={onRemove}
      onView={onView}
      onInvalidFile={onInvalidFile}
    />,
  );
  return { onUpload, onRemove, onView, onInvalidFile, user: userEvent.setup() };
}

async function linkDocument(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("combobox", { name: /Certificación asociada/ }));
  await user.click(await screen.findByRole("option", { name: "Scrum Master" }));
  await user.upload(screen.getByLabelText(/Archivo de respaldo/), CERTIFICATE_PDF);
  await user.click(screen.getByRole("button", { name: "Guardar documento" }));
}

describe("CertificationDocumentsPanel", () => {
  afterEach(() => {
    cleanup();
  });

  it("always renders the link form and the uploaded documents section", () => {
    renderPanel({ certifications: [] });

    expect(screen.getByText("Documentos de respaldo", { selector: "[data-slot=card-title]" })).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Vincular documento" })).toBeInTheDocument();
    expect(screen.getByText("DOCUMENTOS CARGADOS")).toBeInTheDocument();
    expect(screen.getByText("Aún no has cargado documentos de respaldo.")).toBeInTheDocument();
  });

  it("lists only the certifications that have a document", () => {
    renderPanel();

    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    expect(
      within(list).getByRole("button", { name: "Ver documento de Scrum Master" }),
    ).toBeInTheDocument();
  });

  it("links a document and shows its file details in the list", async () => {
    const { onUpload, user } = renderPanel();

    await linkDocument(user);

    expect(onUpload).toHaveBeenCalledWith(SCRUM, CERTIFICATE_PDF);
    expect(
      await screen.findByRole("button", { name: "Ver documento de Scrum Master" }),
    ).toHaveTextContent("scrum_fundamentals.pdf");
    expect(screen.getByText(/^PDF · .+ · Scrum Master$/)).toBeInTheDocument();
  });

  it("does not record the file details when the upload fails", async () => {
    const { user } = renderPanel({ onUpload: vi.fn().mockResolvedValue(false) });

    await linkDocument(user);

    expect(await screen.findByRole("button", { name: "Guardar documento" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Ver documento de Scrum Master" })).toHaveTextContent(
      "Documento de respaldo",
    );
  });

  it("opens the document", async () => {
    const { onView, user } = renderPanel();

    await user.click(screen.getByRole("button", { name: "Ver documento de Scrum Master" }));

    expect(onView).toHaveBeenCalledWith(SCRUM);
  });

  it("replaces the document with a new file", async () => {
    const { onUpload, user } = renderPanel();
    const input = screen.getByLabelText("Archivo de reemplazo") as HTMLInputElement;
    const clickSpy = vi.spyOn(input, "click");

    await user.click(screen.getByRole("button", { name: "Reemplazar documento de Scrum Master" }));
    await user.upload(input, CERTIFICATE_PDF);

    expect(clickSpy).toHaveBeenCalled();
    expect(onUpload).toHaveBeenCalledWith(SCRUM, CERTIFICATE_PDF);
    expect(
      await screen.findByRole("button", { name: "Ver documento de Scrum Master" }),
    ).toHaveTextContent("scrum_fundamentals.pdf");
  });

  it("reports an invalid replacement file without uploading it", async () => {
    const { onUpload, onInvalidFile, user } = renderPanel();
    await user.click(screen.getByRole("button", { name: "Reemplazar documento de Scrum Master" }));

    fireEvent.change(screen.getByLabelText("Archivo de reemplazo"), {
      target: { files: [new File(["text"], "notes.txt", { type: "text/plain" })] },
    });

    expect(onInvalidFile).toHaveBeenCalledWith(FILE_VALIDATION_MESSAGES.invalidCertificateType);
    expect(onUpload).not.toHaveBeenCalled();
  });

  it("ignores an empty replacement selection", async () => {
    const { onUpload, onInvalidFile, user } = renderPanel();
    await user.click(screen.getByRole("button", { name: "Reemplazar documento de Scrum Master" }));

    fireEvent.change(screen.getByLabelText("Archivo de reemplazo"), { target: { files: [] } });

    expect(onUpload).not.toHaveBeenCalled();
    expect(onInvalidFile).not.toHaveBeenCalled();
  });

  it("ignores a replacement file when no document was chosen to replace", () => {
    const { onUpload } = renderPanel();

    fireEvent.change(screen.getByLabelText("Archivo de reemplazo"), {
      target: { files: [CERTIFICATE_PDF] },
    });

    expect(onUpload).not.toHaveBeenCalled();
  });

  it("asks for confirmation and removes the document", async () => {
    let finishRemoval: (value: boolean) => void = () => undefined;
    const onRemove = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          finishRemoval = resolve;
        }),
    );
    const { user } = renderPanel({ onRemove });

    await user.click(screen.getByRole("button", { name: "Eliminar documento de Scrum Master" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText("Eliminar documento")).toBeInTheDocument();
    expect(within(dialog).getByText(/"Scrum Master"/)).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));

    expect(within(dialog).getByRole("button", { name: "Eliminando..." })).toBeDisabled();

    await act(async () => {
      finishRemoval(true);
    });

    expect(onRemove).toHaveBeenCalledWith(SCRUM);
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  it("keeps the details of the document when the removal fails", async () => {
    const { user } = renderPanel({ onRemove: vi.fn().mockResolvedValue(false) });

    await user.click(screen.getByRole("button", { name: "Eliminar documento de Scrum Master" }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Ver documento de Scrum Master" })).toBeInTheDocument();
  });

  it("cancels the removal without calling the handler", async () => {
    const { onRemove, user } = renderPanel();

    await user.click(screen.getByRole("button", { name: "Eliminar documento de Scrum Master" }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(onRemove).not.toHaveBeenCalled();
  });

  it("forgets the file details after removing the document", async () => {
    const { user } = renderPanel();
    await linkDocument(user);
    await screen.findByText(/^PDF · .+ · Scrum Master$/);

    await user.click(screen.getByRole("button", { name: "Eliminar documento de Scrum Master" }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(screen.queryByText(/^PDF · .+ · Scrum Master$/)).not.toBeInTheDocument();
  });

  it("disables the document actions while busy", () => {
    renderPanel({ isBusy: true });

    expect(screen.getByRole("button", { name: "Reemplazar documento de Scrum Master" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
  });
});
