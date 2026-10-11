import { act, cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { accessRequestService } from "../../services/access-request.service";
import type { ApiResult } from "../../types/access-request.types";
import { DocumentPreviewCard } from "./document-preview-card";
import {
  failure,
  makeFile,
  reachStep2,
  renderWithContext,
  stubObjectUrls,
  uploadFile,
  uploadSucceeds,
} from "./document-step-test-utils";

vi.mock("../../services/access-request.service", () => ({
  accessRequestService: {
    createAccessRequest: vi.fn(),
    updateAccessRequest: vi.fn(),
    deleteAccessRequest: vi.fn(),
    uploadDocument: vi.fn(),
    removeDocument: vi.fn(),
  },
}));

const removeDoc = vi.mocked(accessRequestService.removeDocument);

async function withDocument(file: File) {
  uploadSucceeds();
  const view = renderWithContext(<DocumentPreviewCard />);
  await reachStep2(view.ctx, "national_title");
  await uploadFile(view.ctx, file);
  return view;
}

describe("DocumentPreviewCard", () => {
  beforeEach(() => {
    vi.mocked(accessRequestService.createAccessRequest).mockReset();
    vi.mocked(accessRequestService.uploadDocument).mockReset();
    removeDoc.mockReset();
    stubObjectUrls();
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("no muestra nada sin documento", () => {
    const { container } = renderWithContext(<DocumentPreviewCard />);

    expect(screen.queryByText("Listo")).toBeNull();
    expect(container.querySelector("object, img")).toBeNull();
  });

  it("muestra nombre, tamaño legible y el estado Listo", async () => {
    await withDocument(makeFile("diploma.pdf", "application/pdf", 2415919));

    expect(screen.getByText("diploma.pdf")).toBeInTheDocument();
    expect(screen.getByText("2,3 MB")).toBeInTheDocument();
    expect(screen.getByText("Listo")).toBeInTheDocument();
  });

  it("un PNG se muestra como imagen con su texto alternativo", async () => {
    await withDocument(makeFile("foto.png", "image/png", 340 * 1024));

    const image = screen.getByAltText("Vista previa de foto.png");
    expect(image.tagName).toBe("IMG");
    expect(image.getAttribute("src")).toContain("blob:preview-1");
    expect(screen.getByText("340 KB")).toBeInTheDocument();
  });

  it("un PDF se muestra con object y un texto de respaldo", async () => {
    const view = await withDocument(makeFile("titulo.pdf"));

    const object = view.container.querySelector("object");
    expect(object).toHaveAttribute("data", "blob:preview-1");
    expect(object).toHaveAttribute("type", "application/pdf");
    expect(screen.getByText("No se puede mostrar la vista previa de este PDF.")).toBeInTheDocument();
    expect(view.container.querySelector("img")).toBeNull();
  });

  it("Ver es un enlace a una pestaña nueva con rel seguro", async () => {
    await withDocument(makeFile());

    const link = screen.getByRole("link", { name: "Ver" });
    expect(link).toHaveAttribute("href", "blob:preview-1");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("Quitar llama a removeDocument y la tarjeta desaparece", async () => {
    removeDoc.mockResolvedValue({ ok: true, data: { id: "draft-1", documentFileId: null } });
    const view = await withDocument(makeFile());

    await userEvent.setup().click(screen.getByRole("button", { name: "Quitar" }));

    expect(removeDoc).toHaveBeenCalledWith("draft-1");
    expect(view.ctx().hasDocument).toBe(false);
    expect(screen.queryByText("Listo")).toBeNull();
  });

  it("mientras quita dice Quitando... y queda deshabilitado", async () => {
    let finish!: (value: ApiResult<never>) => void;
    removeDoc.mockReturnValue(new Promise((done) => (finish = done as never)));
    await withDocument(makeFile());

    await userEvent.setup().click(screen.getByRole("button", { name: "Quitar" }));

    const busy = screen.getByRole("button", { name: "Quitando..." });
    expect(busy).toBeDisabled();

    await act(async () => {
      finish({ ok: true, data: { id: "draft-1", documentFileId: null } } as never);
    });
  });

  it("si quitar falla muestra el error y conserva la tarjeta", async () => {
    removeDoc.mockResolvedValue(failure(409, "La solicitud ya fue enviada y no se puede modificar"));
    await withDocument(makeFile());

    await userEvent.setup().click(screen.getByRole("button", { name: "Quitar" }));

    expect(await screen.findByText("La solicitud ya fue enviada y no se puede modificar")).toBeInTheDocument();
    expect(screen.getByText("Listo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quitar" })).toBeEnabled();
  });
});
