import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CERTIFICATION_DOCUMENT_MESSAGES } from "../config/certification-document.config";
import type { CertificationDocumentPreview } from "../types/certification-document-preview.types";
import { CertificationDocumentViewer } from "./certification-document-viewer";

const downloadFileMock = vi.hoisted(() => vi.fn());

vi.mock("@/shared/utils/download-file", () => ({
  downloadFile: downloadFileMock,
}));

function createPreview(type: string, fileName: string): CertificationDocumentPreview {
  return {
    certificationName: "Scrum Master",
    fileName,
    file: new Blob(["contenido"], { type }),
    previewUrl: "blob:preview",
  };
}

function renderViewer(preview: CertificationDocumentPreview | null) {
  const onClose = vi.fn();
  render(<CertificationDocumentViewer preview={preview} onClose={onClose} />);
  return { onClose, user: userEvent.setup() };
}

describe("CertificationDocumentViewer", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders nothing without a preview", () => {
    renderViewer(null);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("previews a pdf in a frame and shows its names", () => {
    renderViewer(createPreview("application/pdf", "titulo.pdf"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Documento de respaldo")).toBeInTheDocument();
    expect(screen.getByText("Scrum Master · titulo.pdf")).toBeInTheDocument();
    expect(screen.getByTitle("Documento de Scrum Master")).toHaveAttribute("src", "blob:preview");
  });

  it("previews an image", () => {
    renderViewer(createPreview("image/png", "titulo.png"));

    expect(screen.getByAltText("Documento de Scrum Master")).toBeInTheDocument();
  });

  it("explains when the type has no preview", () => {
    renderViewer(createPreview("application/octet-stream", "titulo.bin"));

    expect(screen.getByText(CERTIFICATION_DOCUMENT_MESSAGES.previewUnavailable)).toBeInTheDocument();
  });

  it("downloads the loaded file with its name and keeps the viewer open", async () => {
    const preview = createPreview("application/pdf", "titulo.pdf");
    const { onClose, user } = renderViewer(preview);

    await user.click(screen.getByRole("button", { name: "Descargar" }));

    expect(downloadFileMock).toHaveBeenCalledWith(preview.file, "titulo.pdf");
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the download error inside the viewer and clears it on retry", async () => {
    downloadFileMock.mockImplementationOnce(() => {
      throw new Error("failed");
    });
    const { onClose, user } = renderViewer(createPreview("application/pdf", "titulo.pdf"));

    await user.click(screen.getByRole("button", { name: "Descargar" }));

    expect(screen.getByRole("alert")).toHaveTextContent(CERTIFICATION_DOCUMENT_MESSAGES.downloadError);
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Descargar" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("notifies when the viewer is closed", async () => {
    const { onClose, user } = renderViewer(createPreview("application/pdf", "titulo.pdf"));

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
