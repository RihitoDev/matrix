import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_FILE_SIZE_BYTES } from "@/modules/profile/config/file-upload.config";
import { documentsService } from "../services/documents.service";
import type { SavedCv } from "../types/saved-cv.types";
import { DocumentsCvView } from "./documents-cv-view";

vi.mock("../services/documents.service", () => ({
  documentsService: {
    getCv: vi.fn(),
    uploadCv: vi.fn(),
    deleteCv: vi.fn(),
  },
}));

const PDF_TYPE = "application/pdf";
const CV_SIZE_IN_BYTES = 1258291;
const UPLOAD_DATE = new Date(2026, 8, 20);

const UPLOADED_CV: SavedCv = {
  fileName: "CV_Valeria_Quispe.pdf",
  fileType: "PDF",
  sizeInBytes: CV_SIZE_IN_BYTES,
  updatedAt: UPLOAD_DATE,
};

function createFile(name: string, type = PDF_TYPE, size = CV_SIZE_IN_BYTES): File {
  return new File([new Uint8Array(size)], name, { type });
}

function createDeferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function getFileInput(): HTMLInputElement {
  return screen.getByLabelText("Archivo PDF del CV");
}

async function renderView() {
  await act(async () => {
    render(<DocumentsCvView />);
  });
}

async function chooseAndConfirm(user: ReturnType<typeof userEvent.setup>, file: File) {
  await user.upload(getFileInput(), file);
  await user.click(screen.getByRole("button", { name: "Confirmar carga" }));
}

describe("DocumentsCvView", () => {
  beforeEach(() => {
    vi.mocked(documentsService.getCv).mockResolvedValue(null);
    vi.mocked(documentsService.uploadCv).mockImplementation((file: File) =>
      Promise.resolve({
        fileName: file.name,
        fileType: "PDF",
        sizeInBytes: file.size,
        updatedAt: UPLOAD_DATE,
      }),
    );
    vi.mocked(documentsService.deleteCv).mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the cv title in the header and the main heading", async () => {
    await renderView();

    expect(screen.getByRole("heading", { level: 1, name: "Currículum Vitae" })).toBeInTheDocument();
    expect(screen.getAllByText("Currículum Vitae")).toHaveLength(2);
    expect(screen.queryByText("Currículum PDF")).not.toBeInTheDocument();
    expect(
      screen.getByText("Sube tu CV para tenerlo disponible en el perfil y mantenerlo actualizado"),
    ).toBeInTheDocument();
  });

  it("shows the profile tabs with Documentos active", async () => {
    await renderView();

    const documentsTab = screen.getByRole("link", { name: "Documentos" });

    expect(screen.getByRole("link", { name: "Datos personales" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Presentación" })).toBeInTheDocument();
    expect(screen.getByText("Trayectoria")).toBeInTheDocument();
    expect(documentsTab).toHaveAttribute("href", "/profile/documents");
    expect(documentsTab).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByText("Documentos")).toHaveLength(1);
  });

  it("does not show the steps indicator nor the certifications link", async () => {
    await renderView();

    expect(screen.queryByRole("list", { name: "Pasos de documentos" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ver certificaciones" })).not.toBeInTheDocument();
  });

  it("renders the select button enabled in the server html to avoid a hydration mismatch", () => {
    const html = renderToString(<DocumentsCvView />);
    const selectButton = html.match(/<button[^>]*>Seleccionar PDF<\/button>/)?.[0];

    expect(selectButton).toBeDefined();
    expect(selectButton).not.toMatch(/\sdisabled(=|\s|>)/);
  });

  it("renders the same enabled actions before and after the saved cv loads", async () => {
    const pendingLoad = createDeferred<SavedCv | null>();
    vi.mocked(documentsService.getCv).mockReturnValueOnce(pendingLoad.promise);
    render(<DocumentsCvView />);

    expect(screen.getByRole("button", { name: "Seleccionar PDF" })).toBeEnabled();
    expect(screen.getByText("Cargando tu CV...")).toBeInTheDocument();

    await act(async () => {
      pendingLoad.resolve(UPLOADED_CV);
    });

    expect(screen.queryByText("Cargando tu CV...")).not.toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Seleccionar PDF" })).toBeEnabled();
    expect(screen.getByText("CV_Valeria_Quispe.pdf")).toBeInTheDocument();
  });

  it("shows the saved cv returned by the server when opening the page", async () => {
    vi.mocked(documentsService.getCv).mockResolvedValue(UPLOADED_CV);

    await renderView();

    expect(documentsService.getCv).toHaveBeenCalledTimes(1);
    expect(screen.getByText("CV_Valeria_Quispe.pdf")).toBeInTheDocument();
    expect(screen.getByText("Cargado correctamente")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reemplazar CV" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Eliminar CV" })).toBeEnabled();
  });

  it("shows a spanish error when the saved cv cannot be loaded", async () => {
    vi.mocked(documentsService.getCv).mockRejectedValue(new Error("Network Error"));

    await renderView();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "No se pudo cargar tu CV. Intenta de nuevo más tarde.",
    );
    expect(
      screen.getByText("Al confirmar la carga, el archivo se mostrará aquí."),
    ).toBeInTheDocument();
  });

  it("starts with the empty state and the confirm button disabled", async () => {
    await renderView();

    expect(screen.getByText("Subir currículum")).toBeInTheDocument();
    expect(screen.getByText("Selecciona tu CV en formato PDF")).toBeInTheDocument();
    expect(
      screen.getByText("Al confirmar la carga, el archivo se mostrará aquí."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Seleccionar PDF" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Confirmar carga" })).toBeDisabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("opens the file picker from Seleccionar PDF", async () => {
    const user = userEvent.setup();
    await renderView();
    const clickSpy = vi.spyOn(getFileInput(), "click");

    await user.click(screen.getByRole("button", { name: "Seleccionar PDF" }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(getFileInput()).toHaveAttribute("accept", "application/pdf,.pdf");
  });

  it("uploads a valid pdf to the server, shows the saved file and a success message", async () => {
    const user = userEvent.setup();
    await renderView();
    const file = createFile("CV_Valeria_Quispe.pdf");

    await user.upload(getFileInput(), file);

    expect(screen.getByText("CV_Valeria_Quispe.pdf · 1.2 MB")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmar carga" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Tu CV se cargó correctamente.");
    expect(documentsService.uploadCv).toHaveBeenCalledWith(file);
    expect(screen.getByText("CV_Valeria_Quispe.pdf")).toBeInTheDocument();
    expect(screen.getByText("Cargado correctamente")).toBeInTheDocument();
    expect(screen.queryByText("CV_Valeria_Quispe.pdf · 1.2 MB")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar carga" })).toBeDisabled();
  });

  it.each([
    [415, "El CV debe estar en formato PDF."],
    [413, "El archivo supera el límite de 5 MB."],
    [400, "El archivo está vacío. Selecciona otro archivo."],
    [422, "El archivo está dañado o incompleto. Selecciona otro PDF."],
  ])(
    "shows a spanish message and clears the selection when the server rejects the file with %i",
    async (status, message) => {
      const user = userEvent.setup();
      vi.mocked(documentsService.getCv).mockResolvedValue(UPLOADED_CV);
      vi.mocked(documentsService.uploadCv).mockRejectedValueOnce({ response: { status } });
      await renderView();

      await chooseAndConfirm(user, createFile("CV_Nuevo.pdf"));

      expect(await screen.findByRole("alert")).toHaveTextContent(message);
      expect(screen.getByText("CV_Valeria_Quispe.pdf")).toBeInTheDocument();
      expect(screen.queryByText("CV_Nuevo.pdf")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Confirmar carga" })).toBeDisabled();
    },
  );

  it.each([
    ["a server error", { response: { status: 500 } }],
    ["a network error", new Error("Network Error")],
  ])("keeps the selected file to retry after %s", async (_reason, error) => {
    const user = userEvent.setup();
    vi.mocked(documentsService.uploadCv).mockRejectedValueOnce(error);
    await renderView();
    const file = createFile("CV_Nuevo.pdf");

    await chooseAndConfirm(user, file);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo subir tu CV. Intenta de nuevo.",
    );
    expect(screen.getByText("CV_Nuevo.pdf · 1.2 MB")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar carga" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Confirmar carga" }));

    expect(documentsService.uploadCv).toHaveBeenCalledTimes(2);
    expect(documentsService.uploadCv).toHaveBeenLastCalledWith(file);
    expect(await screen.findByRole("status")).toHaveTextContent("Tu CV se cargó correctamente.");
    expect(screen.queryByText("CV_Nuevo.pdf · 1.2 MB")).not.toBeInTheDocument();
  });

  it("shows an error and returns to the initial state for a file that is not a pdf", async () => {
    const user = userEvent.setup({ applyAccept: false });
    await renderView();

    await user.upload(getFileInput(), createFile("CV_Valeria_Quispe.pdf"));
    await user.upload(getFileInput(), createFile("foto.png", "image/png"));

    expect(screen.getByRole("alert")).toHaveTextContent("El CV debe estar en formato PDF.");
    expect(screen.queryByText("CV_Valeria_Quispe.pdf · 1.2 MB")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar carga" })).toBeDisabled();
    expect(
      screen.getByText("Al confirmar la carga, el archivo se mostrará aquí."),
    ).toBeInTheDocument();
    expect(documentsService.uploadCv).not.toHaveBeenCalled();
  });

  it("shows the size limit error for a pdf larger than 5 MB", async () => {
    const user = userEvent.setup();
    await renderView();

    await user.upload(getFileInput(), createFile("cv.pdf", PDF_TYPE, MAX_FILE_SIZE_BYTES + 1));

    expect(screen.getByRole("alert")).toHaveTextContent("El archivo supera el límite de 5 MB.");
    expect(screen.getByRole("button", { name: "Confirmar carga" })).toBeDisabled();
  });

  it("shows an error for an empty pdf", async () => {
    const user = userEvent.setup();
    await renderView();

    await user.upload(getFileInput(), createFile("cv.pdf", PDF_TYPE, 0));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "El archivo está vacío. Selecciona otro archivo.",
    );
    expect(screen.getByRole("button", { name: "Confirmar carga" })).toBeDisabled();
  });

  it("clears the error when a valid pdf is chosen after an invalid one", async () => {
    const user = userEvent.setup({ applyAccept: false });
    await renderView();

    await user.upload(getFileInput(), createFile("foto.png", "image/png"));

    expect(screen.getByRole("alert")).toBeInTheDocument();

    await user.upload(getFileInput(), createFile("CV_Valeria_Quispe.pdf"));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("CV_Valeria_Quispe.pdf · 1.2 MB")).toBeInTheDocument();
  });

  it("ignores a selection without files", async () => {
    await renderView();

    fireEvent.change(getFileInput(), { target: { files: [] } });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar carga" })).toBeDisabled();
  });

  it("shows the spinner and blocks repeated clicks while uploading", async () => {
    const user = userEvent.setup();
    const pendingUpload = createDeferred<SavedCv>();
    vi.mocked(documentsService.getCv).mockResolvedValue(UPLOADED_CV);
    vi.mocked(documentsService.uploadCv).mockReturnValueOnce(pendingUpload.promise);
    await renderView();

    await chooseAndConfirm(user, createFile("CV_Nuevo.pdf"));

    const uploadingButton = screen.getByRole("button", { name: "Cargando..." });

    expect(uploadingButton).toBeDisabled();
    expect(uploadingButton.querySelector("svg.lucide-loader-circle")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Seleccionar PDF" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Reemplazar CV" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Eliminar CV" })).toBeDisabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await user.click(uploadingButton);

    expect(documentsService.uploadCv).toHaveBeenCalledTimes(1);

    await act(async () => {
      pendingUpload.resolve({ ...UPLOADED_CV, fileName: "CV_Nuevo.pdf" });
    });

    expect(screen.getByRole("status")).toHaveTextContent("Tu CV se reemplazó correctamente.");
    expect(screen.getByRole("button", { name: "Confirmar carga" })).toBeDisabled();
  });

  it("replaces the saved cv from Reemplazar CV", async () => {
    const user = userEvent.setup();
    vi.mocked(documentsService.getCv).mockResolvedValue(UPLOADED_CV);
    await renderView();
    const clickSpy = vi.spyOn(getFileInput(), "click");

    await user.click(screen.getByRole("button", { name: "Reemplazar CV" }));

    expect(clickSpy).toHaveBeenCalledTimes(1);

    await chooseAndConfirm(user, createFile("CV_Nuevo.pdf"));

    expect(await screen.findByText("Tu CV se reemplazó correctamente.")).toBeInTheDocument();
    expect(screen.getByText("CV_Nuevo.pdf")).toBeInTheDocument();
    expect(screen.queryByText("CV_Valeria_Quispe.pdf")).not.toBeInTheDocument();
  });

  it("keeps the cv when cancelling the delete dialog", async () => {
    const user = userEvent.setup();
    vi.mocked(documentsService.getCv).mockResolvedValue(UPLOADED_CV);
    await renderView();

    await user.click(screen.getByRole("button", { name: "Eliminar CV" }));

    const dialog = await screen.findByRole("alertdialog", { name: "¿Eliminar tu CV?" });

    expect(dialog).toHaveAccessibleDescription("El archivo dejará de estar disponible en tu perfil.");

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(documentsService.deleteCv).not.toHaveBeenCalled();
    expect(screen.getByText("CV_Valeria_Quispe.pdf")).toBeInTheDocument();
  });

  it("disables the upload actions while deleting", async () => {
    const user = userEvent.setup();
    const pendingDelete = createDeferred<void>();
    vi.mocked(documentsService.getCv).mockResolvedValue(UPLOADED_CV);
    vi.mocked(documentsService.deleteCv).mockReturnValueOnce(pendingDelete.promise);
    await renderView();

    await user.upload(getFileInput(), createFile("CV_Nuevo.pdf"));
    await user.click(screen.getByRole("button", { name: "Eliminar CV" }));
    await user.click(await screen.findByRole("button", { name: "Eliminar" }));

    expect(screen.getByRole("button", { name: "Eliminando..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Seleccionar PDF", hidden: true })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Confirmar carga", hidden: true })).toBeDisabled();

    await act(async () => {
      pendingDelete.resolve();
    });

    expect(documentsService.deleteCv).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Confirmar carga" })).toBeEnabled();
  });

  it("deletes the cv on the server after confirming", async () => {
    const user = userEvent.setup();
    vi.mocked(documentsService.getCv).mockResolvedValue(UPLOADED_CV);
    await renderView();

    await user.click(screen.getByRole("button", { name: "Eliminar CV" }));
    await user.click(await screen.findByRole("button", { name: "Eliminar" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(documentsService.deleteCv).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Tu CV se eliminó.");
    expect(
      screen.getByText("Al confirmar la carga, el archivo se mostrará aquí."),
    ).toBeInTheDocument();
    expect(screen.queryByText("CV_Valeria_Quispe.pdf")).not.toBeInTheDocument();
  });

  it("keeps the cv and shows a spanish message when the server fails to delete it", async () => {
    const user = userEvent.setup();
    vi.mocked(documentsService.getCv).mockResolvedValue(UPLOADED_CV);
    vi.mocked(documentsService.deleteCv).mockRejectedValueOnce({ response: { status: 404 } });
    await renderView();

    await user.click(screen.getByRole("button", { name: "Eliminar CV" }));
    await user.click(await screen.findByRole("button", { name: "Eliminar" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(screen.getByRole("alert")).toHaveTextContent("No encontramos tu CV. Recarga la página.");
    expect(screen.getByText("CV_Valeria_Quispe.pdf")).toBeInTheDocument();
  });
});
