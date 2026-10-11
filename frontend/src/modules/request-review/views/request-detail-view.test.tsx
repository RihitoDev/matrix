import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { detail } from "../components/detail/data-contrast-panel.test";
import { requestReviewService } from "../services/request-review.service";
import { RequestDetailView } from "./request-detail-view";

const getRequestDetail = vi.spyOn(requestReviewService, "getRequestDetail");
const getDocumentBlob = vi.spyOn(requestReviewService, "getDocumentBlob");
const revoke = vi.fn();

describe("RequestDetailView", () => {
  beforeEach(() => {
    getRequestDetail.mockReset();
    getDocumentBlob.mockReset();
    revoke.mockReset();
    vi.stubGlobal("URL", { createObjectURL: () => "blob:documento", revokeObjectURL: revoke });
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("muestra el esqueleto y luego el encabezado, el visor y el panel de contraste", async () => {
    getRequestDetail.mockResolvedValue({ ok: true, data: detail });
    getDocumentBlob.mockResolvedValue({ ok: true, data: new Blob(["%PDF"]) });
    render(<RequestDetailView id="id-1" />);

    expect(screen.getByTestId("detail-skeleton")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "José Luis Pérez" })).toBeInTheDocument();
    expect(screen.getByText("SOL-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("En revisión")).toBeInTheDocument();
    expect(await screen.findByTitle("Documento de respaldo")).toHaveAttribute("src", "blob:documento#toolbar=0&navpanes=0&view=FitH");
    expect(screen.getByRole("region", { name: "Contraste de datos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Volver a la bandeja/ })).toHaveAttribute("href", "/backoffice/solicitudes");
    expect(getDocumentBlob).toHaveBeenCalledWith("id-1");
  });

  it("muestra el error si la solicitud no se puede cargar", async () => {
    getRequestDetail.mockResolvedValue({ ok: false, status: 404, message: "La solicitud no existe." });
    render(<RequestDetailView id="x" />);

    expect(await screen.findByRole("alert")).toHaveTextContent("La solicitud no existe.");
    expect(getDocumentBlob).not.toHaveBeenCalled();
  });

  it("avisa si la solicitud no tiene documento y no lo pide", async () => {
    getRequestDetail.mockResolvedValue({ ok: true, data: { ...detail, document: null, requestCode: null } });
    render(<RequestDetailView id="id-1" />);

    expect(await screen.findByText("Esta solicitud no tiene un documento adjunto.")).toBeInTheDocument();
    expect(getDocumentBlob).not.toHaveBeenCalled();
  });

  it("muestra el error del documento si no se puede descargar", async () => {
    getRequestDetail.mockResolvedValue({ ok: true, data: detail });
    getDocumentBlob.mockResolvedValue({ ok: false, status: 0, message: "No se pudo conectar con el servidor. Inténtalo de nuevo." });
    render(<RequestDetailView id="id-1" />);

    expect(await screen.findByText("No se pudo conectar con el servidor. Inténtalo de nuevo.")).toBeInTheDocument();
  });

  it("libera la URL del documento al salir", async () => {
    getRequestDetail.mockResolvedValue({ ok: true, data: detail });
    getDocumentBlob.mockResolvedValue({ ok: true, data: new Blob(["%PDF"]) });
    const view = render(<RequestDetailView id="id-1" />);
    await screen.findByTitle("Documento de respaldo");

    view.unmount();

    expect(revoke).toHaveBeenCalledWith("blob:documento");
  });

  it("al aprobar, el estado en pantalla pasa de En revisión a Aprobada", async () => {
    getRequestDetail.mockResolvedValue({ ok: true, data: detail });
    getDocumentBlob.mockResolvedValue({ ok: true, data: new Blob(["%PDF"]) });
    vi.spyOn(requestReviewService, "approveRequest").mockResolvedValue({
      ok: true,
      data: { id: "id-1", status: "approved", activationCodeSent: true },
    });
    render(<RequestDetailView id="id-1" />);
    expect(await screen.findByText("En revisión")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Aprobar solicitud" }));
    fireEvent.click(await screen.findByRole("button", { name: "Aprobar y enviar código" }));

    expect(await screen.findByText("Aprobada")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Aprobar solicitud" })).toBeNull();
  });

  it("al rechazar con motivo, el estado en pantalla pasa a Rechazada", async () => {
    getRequestDetail.mockResolvedValue({ ok: true, data: detail });
    getDocumentBlob.mockResolvedValue({ ok: true, data: new Blob(["%PDF"]) });
    vi.spyOn(requestReviewService, "rejectRequest").mockResolvedValue({
      ok: true,
      data: { id: "id-1", status: "rejected", notificationSent: true },
    });
    render(<RequestDetailView id="id-1" />);
    await screen.findByText("En revisión");

    fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));
    await screen.findByLabelText("Indicación para el solicitante");
    fireEvent.click(screen.getByRole("radio", { name: "Documento ilegible" }));
    fireEvent.click(screen.getByRole("button", { name: "Rechazar y notificar" }));

    expect(await screen.findByText("Rechazada")).toBeInTheDocument();
  });

  it("muestra las migas, el nombre con la pastilla de estado y el subtítulo con la carrera y la fecha larga", async () => {
    getRequestDetail.mockResolvedValue({
      ok: true,
      data: { ...detail, history: { submittedAt: "2026-09-22T13:14:00.000Z", reviewedAt: "2026-09-22T15:02:00.000Z", reviewedBy: "Carla Montaño", rejectionReason: null } },
    });
    getDocumentBlob.mockResolvedValue({ ok: true, data: new Blob(["%PDF"]) });
    render(<RequestDetailView id="id-1" />);

    expect(await screen.findByRole("heading", { name: "José Luis Pérez" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Solicitudes de acceso" })).toHaveAttribute("href", "/backoffice/solicitudes");
    expect(screen.getByText("SOL-2026-0001")).toHaveClass("font-semibold");
    expect(screen.getByText("En revisión")).toHaveClass("rounded-full");
    expect(screen.getByText(/Licenciatura en Ingeniería de Sistemas\. Solicitud enviada el 22 de septiembre de 2026, 09:14\./)).toBeInTheDocument();
    expect(screen.getByText("Historial de esta solicitud")).toBeInTheDocument();
    expect(screen.getByText("Abierta por Carla Montaño")).toBeInTheDocument();
    expect(await screen.findByText("Documento: Diploma académico")).toBeInTheDocument();
    expect(screen.queryByText("Anterior")).toBeNull();
    expect(screen.queryByText("Siguiente")).toBeNull();
  });

  it("sin historial ni fecha de envío no inventa nada", async () => {
    getRequestDetail.mockResolvedValue({ ok: true, data: detail });
    getDocumentBlob.mockResolvedValue({ ok: true, data: new Blob(["%PDF"]) });
    render(<RequestDetailView id="id-1" />);

    await screen.findByRole("heading", { name: "José Luis Pérez" });
    expect(screen.queryByText("Historial de esta solicitud")).toBeNull();
    expect(screen.getByText("Licenciatura en Ingeniería de Sistemas.")).toBeInTheDocument();
  });

  it("estructura: raíz de ancho completo, relleno de 32 px, cuadrícula de dos columnas y contraste con tabla fija", async () => {
    getRequestDetail.mockResolvedValue({ ok: true, data: detail });
    getDocumentBlob.mockResolvedValue({ ok: true, data: new Blob(["%PDF"]) });
    const { container } = render(<RequestDetailView id="id-1" />);
    await screen.findByRole("heading", { name: "José Luis Pérez" });

    expect(container.firstElementChild).toHaveClass("w-full", "min-w-0");
    expect(container.querySelector("section")).toHaveClass("p-8", "w-full", "min-w-0");
    expect(container.querySelector(".grid")?.className).toContain("lg:grid-cols-[minmax(0,1.37fr)_minmax(0,1fr)]");
    expect(container.querySelector("table")).toHaveClass("table-fixed");
    expect(screen.getByText("En el documento")).toBeInTheDocument();
  });
});
