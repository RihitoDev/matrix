import { act, cleanup, createEvent, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { accessRequestService } from "../../services/access-request.service";
import type { ApiResult } from "../../types/access-request.types";
import { DocumentDropzone } from "./document-dropzone";
import {
  DRAFT_ID,
  failure,
  makeFile,
  reachStep2,
  renderWithContext,
  stubObjectUrls,
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

const upload = vi.mocked(accessRequestService.uploadDocument);
const input = () => screen.getByLabelText("Archivo del documento") as HTMLInputElement;
const zone = () => document.querySelector("[data-slot='document-dropzone']") as HTMLElement;
const INVALID_FORMAT = "Formato no permitido. Solo se aceptan archivos JPG, PNG o PDF.";

describe("DocumentDropzone", () => {
  beforeEach(() => {
    vi.mocked(accessRequestService.createAccessRequest).mockReset();
    upload.mockReset();
    stubObjectUrls();
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("muestra los textos de ayuda en español", () => {
    renderWithContext(<DocumentDropzone />);

    expect(screen.getByText("Arrastra tu documento aquí o elige un archivo.")).toBeInTheDocument();
    expect(screen.getByText("JPG, PNG o PDF. Máximo 10 MB.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Elegir archivo" })).toBeEnabled();
  });

  it("el input es de archivo, acepta solo JPG, PNG y PDF, sin multiple ni capture", () => {
    renderWithContext(<DocumentDropzone />);

    expect(input()).toHaveAttribute("type", "file");
    expect(input()).toHaveAttribute("accept", "image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf");
    expect(input()).not.toHaveAttribute("multiple");
    expect(input()).not.toHaveAttribute("capture");
    expect(input()).toHaveClass("sr-only");
  });

  it("el botón Elegir archivo abre el selector del input", async () => {
    renderWithContext(<DocumentDropzone />);
    const click = vi.spyOn(input(), "click");

    await userEvent.setup().click(screen.getByRole("button", { name: "Elegir archivo" }));

    expect(click).toHaveBeenCalledTimes(1);
  });

  it("elegir un archivo llama al servicio con el borrador, el archivo y el tipo", async () => {
    uploadSucceeds("academic_diploma");
    const view = renderWithContext(<DocumentDropzone />);
    await reachStep2(view.ctx, "academic_diploma");
    const file = makeFile("diploma.pdf");

    await userEvent.setup().upload(input(), file);

    expect(upload).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledWith(DRAFT_ID, file, "academic_diploma", expect.any(Function));
  });

  it("arrastrar y soltar llama igual y toma solo el primer archivo", async () => {
    uploadSucceeds();
    const view = renderWithContext(<DocumentDropzone />);
    await reachStep2(view.ctx, "national_title");
    const first = makeFile("uno.pdf");
    const second = makeFile("dos.pdf");

    await act(async () => {
      fireEvent.drop(zone(), { dataTransfer: { files: [first, second] } });
    });

    expect(upload).toHaveBeenCalledTimes(1);
    expect(upload.mock.calls[0][1]).toBe(first);
  });

  it("soltar sin archivos no hace nada", async () => {
    const view = renderWithContext(<DocumentDropzone />);
    await reachStep2(view.ctx, "national_title");

    await act(async () => {
      fireEvent.drop(zone(), { dataTransfer: { files: [] } });
    });

    expect(upload).not.toHaveBeenCalled();
  });

  it("sin tipo elegido muestra el aviso y no llama al servicio", async () => {
    const view = renderWithContext(<DocumentDropzone />);
    await reachStep2(view.ctx);

    await userEvent.setup().upload(input(), makeFile());

    expect(await screen.findByText("Elige el tipo de documento antes de subir el archivo.")).toBeInTheDocument();
    expect(upload).not.toHaveBeenCalled();
  });

  it.each([
    ["un .docx", makeFile("informe.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"), INVALID_FORMAT],
    ["un archivo de más de 10 MB", makeFile("grande.pdf", "application/pdf", 10 * 1024 * 1024 + 1), "El archivo supera el máximo de 10 MB."],
  ])("rechaza %s con el mensaje exacto y sin llamar al servicio", async (_name, file, message) => {
    const view = renderWithContext(<DocumentDropzone />);
    await reachStep2(view.ctx, "national_title");

    await userEvent.setup({ applyAccept: false }).upload(input(), file);

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(upload).not.toHaveBeenCalled();
    expect(input()).toHaveAttribute("aria-invalid", "true");
  });

  it("durante la subida muestra la barra con el porcentaje y deshabilita todo", async () => {
    let report!: (percent: number) => void;
    let finish!: (value: ApiResult<never>) => void;
    upload.mockImplementation((_id, _file, _type, onProgress) => {
      report = onProgress!;
      return new Promise((done) => (finish = done as never));
    });
    const view = renderWithContext(<DocumentDropzone />);
    await reachStep2(view.ctx, "national_title");

    let pending!: Promise<void>;
    await act(async () => {
      pending = view.ctx().uploadDocument(makeFile());
    });
    act(() => report(55));

    expect(screen.getByRole("progressbar", { name: "Progreso de la subida" })).toHaveAttribute("aria-valuenow", "55");
    expect(screen.getByText("Subiendo... 55%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Elegir archivo" })).toBeDisabled();
    expect(input()).toBeDisabled();

    // Soltar un archivo con la zona deshabilitada no inicia otra subida
    await act(async () => {
      fireEvent.drop(zone(), { dataTransfer: { files: [makeFile("otro.pdf")] } });
    });
    expect(upload).toHaveBeenCalledTimes(1);

    await act(async () => {
      finish({ ok: true, data: { id: DRAFT_ID, documentFileId: "f", documentType: "national_title" } } as never);
      await pending;
    });
    expect(screen.queryByText(/Subiendo/)).toBeNull();
  });

  it("el estado de arrastre cambia la clase y se quita al salir o soltar", () => {
    renderWithContext(<DocumentDropzone />);

    expect(zone()).not.toHaveAttribute("data-dragging");
    fireEvent.dragEnter(zone());
    expect(zone()).toHaveAttribute("data-dragging", "true");
    expect(zone()).toHaveClass("border-ink");

    fireEvent.dragLeave(zone());
    expect(zone()).not.toHaveAttribute("data-dragging");

    fireEvent.dragOver(zone());
    expect(zone()).toHaveAttribute("data-dragging", "true");
    fireEvent.drop(zone(), { dataTransfer: { files: [] } });
    expect(zone()).not.toHaveAttribute("data-dragging");
  });

  it("cruzar un elemento hijo no cancela el estado de arrastre", () => {
    renderWithContext(<DocumentDropzone />);
    fireEvent.dragEnter(zone());

    // jsdom no tiene DragEvent: relatedTarget se asigna a mano en el evento
    const leave = createEvent.dragLeave(zone());
    Object.defineProperty(leave, "relatedTarget", { value: screen.getByRole("button", { name: "Elegir archivo" }) });
    fireEvent(zone(), leave);

    expect(zone()).toHaveAttribute("data-dragging", "true");
  });

  it("limpia el input para poder elegir el mismo archivo otra vez", async () => {
    upload.mockResolvedValue(failure(500, "falló"));
    const view = renderWithContext(<DocumentDropzone />);
    await reachStep2(view.ctx, "national_title");
    const file = makeFile();
    const user = userEvent.setup();

    await user.upload(input(), file);
    expect(input().value).toBe("");
    await user.upload(input(), file);

    expect(upload).toHaveBeenCalledTimes(2);
    expect(upload.mock.calls[1][1]).toBe(file);
    expect(screen.getByText("falló")).toBeInTheDocument();
  });
});
