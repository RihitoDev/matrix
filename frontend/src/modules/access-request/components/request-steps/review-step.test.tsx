import { act, cleanup, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAccessRequestForm } from "../../contexts/access-request-context";
import { accessRequestService } from "../../services/access-request.service";
import type { RequestStatusResponse } from "../../types/access-request.types";
import {
  failure,
  makeFile,
  reachStep2,
  renderWithContext,
  stubObjectUrls,
  uploadFile,
  uploadSucceeds,
} from "../document/document-step-test-utils";
import { ReviewStep } from "./review-step";

vi.mock("../../services/access-request.service", () => ({
  accessRequestService: {
    createAccessRequest: vi.fn(),
    updateAccessRequest: vi.fn(),
    deleteAccessRequest: vi.fn(),
    uploadDocument: vi.fn(),
    removeDocument: vi.fn(),
    submitAccessRequest: vi.fn(),
    getRequestStatus: vi.fn(),
  },
}));

const getStatus = vi.mocked(accessRequestService.getRequestStatus);

// Monta ReviewStep solo cuando ya hay solicitud enviada, como hace la vista al llegar al paso 3
function Gate() {
  const { submission } = useAccessRequestForm();
  return submission ? <ReviewStep /> : null;
}

const statusBody = (overrides: Partial<RequestStatusResponse> = {}): RequestStatusResponse => ({
  requestCode: "SOL-2026-0001",
  status: "pending",
  submittedAt: "2026-10-05T23:59:34.644Z",
  reviewedAt: null,
  rejectionReason: null,
  document: null,
  ...overrides,
});

async function sendAndReview(status: Partial<RequestStatusResponse> | "fail" = {}) {
  uploadSucceeds();
  vi.mocked(accessRequestService.submitAccessRequest).mockResolvedValue({
    ok: true,
    data: { id: "draft-1", requestCode: "SOL-2026-0001", status: "pending", submittedAt: "2026-10-05T23:59:34.644Z" },
  });
  getStatus.mockResolvedValue(status === "fail" ? failure(0, "sin red") : { ok: true, data: statusBody(status) });
  const view = renderWithContext(<Gate />);
  await reachStep2(view.ctx, "national_title");
  await uploadFile(view.ctx, makeFile());
  await act(async () => {
    await view.ctx().submitRequest();
  });
  return view;
}

const stages = () => within(screen.getByRole("list", { name: "Línea de tiempo de la solicitud" })).getAllByRole("listitem");

describe("ReviewStep", () => {
  beforeEach(() => {
    for (const mock of Object.values(accessRequestService)) vi.mocked(mock).mockReset();
    stubObjectUrls();
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("no renderiza nada si no hay solicitud enviada", () => {
    const { container } = renderWithContext(<ReviewStep />);

    expect(screen.queryByRole("heading", { name: "Revisión de la carrera" })).toBeNull();
    expect(container.querySelector("h1")).toBeNull();
    expect(getStatus).not.toHaveBeenCalled();
  });

  it("muestra el título, el correo de aviso y el código de solicitud con su ayuda", async () => {
    await sendAndReview();

    expect(screen.getByRole("heading", { level: 1, name: "Revisión de la carrera" })).toBeInTheDocument();
    expect(
      screen.getByText("Estamos revisando tu solicitud. Te avisaremos a ana@umss.edu.bo cuando tengamos novedades."),
    ).toBeInTheDocument();
    expect(screen.getByText("Tu código de solicitud")).toBeInTheDocument();
    expect(screen.getByText("SOL-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("Guárdalo: lo necesitarás para consultar el estado de tu solicitud.")).toBeInTheDocument();
  });

  it("consulta el estado una sola vez al montar con el código y el correo", async () => {
    await sendAndReview();

    expect(getStatus).toHaveBeenCalledTimes(1);
    expect(getStatus).toHaveBeenCalledWith("SOL-2026-0001", "ana@umss.edu.bo");
  });

  it("pending muestra En revisión con las dos primeras etapas hechas y la revisión en curso", async () => {
    await sendAndReview({ status: "pending" });

    expect(screen.getByText("Estado: En revisión")).toBeInTheDocument();
    const items = stages();
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent("Solicitud enviada: Completada");
    expect(items[0]).toHaveTextContent("5 oct 2026, 19:59");
    expect(items[1]).toHaveTextContent("Documento recibido: Completada");
    expect(items[1]).toHaveTextContent("5 oct 2026, 19:59");
    expect(items[2]).toHaveTextContent("En revisión: En curso");
    expect(items[2]).toHaveAttribute("aria-current", "step");
    expect(items[3]).toHaveTextContent("Activación de tu cuenta: Pendiente");
    expect(items[3]).not.toHaveAttribute("aria-current");
    expect(items[3]).toHaveClass("opacity-60");
    expect(items[0].querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });

  it("in_review se muestra también como En revisión", async () => {
    await sendAndReview({ status: "in_review" });

    expect(screen.getByText("Estado: En revisión")).toBeInTheDocument();
    expect(stages()[2]).toHaveAttribute("aria-current", "step");
  });

  it("approved muestra Aprobada, la revisión hecha con su fecha y la activación en curso", async () => {
    await sendAndReview({ status: "approved", reviewedAt: "2026-10-06T14:30:00.000Z" });

    expect(await screen.findByText("Estado: Aprobada")).toBeInTheDocument();
    const items = stages();
    expect(items[2]).toHaveTextContent("En revisión: Completada");
    expect(items[2]).toHaveTextContent("6 oct 2026, 10:30");
    expect(items[2]).not.toHaveAttribute("aria-current");
    expect(items[3]).toHaveTextContent("Activación de tu cuenta: En curso");
    expect(items[3]).toHaveAttribute("aria-current", "step");
  });

  it("rejected muestra Rechazada con el motivo y la activación no disponible", async () => {
    await sendAndReview({ status: "rejected", reviewedAt: "2026-10-06T14:30:00.000Z", rejectionReason: "Documento ilegible" });

    expect(await screen.findByText("Estado: Rechazada")).toBeInTheDocument();
    expect(screen.getByText("Tu solicitud fue rechazada.")).toBeInTheDocument();
    expect(screen.queryByText(/Estamos revisando tu solicitud/)).toBeNull();
    expect(screen.queryByText(/Te avisaremos a/)).toBeNull();
    expect(screen.getByText("Motivo del rechazo: Documento ilegible")).toBeInTheDocument();
    const items = stages();
    expect(items[2]).toHaveTextContent("En revisión: Completada");
    expect(items[3]).toHaveTextContent("No disponible");
  });

  it.each(["pending", "in_review", "approved"] as const)("con el estado %s mantiene el mensaje de revisión", async (status) => {
    await sendAndReview({ status });

    expect(await screen.findByText(/Estamos revisando tu solicitud\. Te avisaremos a/)).toBeInTheDocument();
    expect(screen.queryByText("Tu solicitud fue rechazada.")).toBeNull();
  });

  it.each(["pending", "in_review", "approved"] as const)("con el estado %s no muestra ningún motivo de rechazo", async (status) => {
    await sendAndReview({ status, rejectionReason: "Motivo que no debe verse" });

    expect(screen.queryByText(/Motivo del rechazo/)).toBeNull();
    expect(screen.queryByText(/Motivo que no debe verse/)).toBeNull();
  });

  it("si la consulta falla la pantalla sigue mostrando el estado del envío", async () => {
    await sendAndReview("fail");

    expect(screen.getByText("SOL-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("Estado: En revisión")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("no ofrece botones de volver ni de editar", async () => {
    await sendAndReview();

    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("no usa el término egresado ni sus variantes", async () => {
    await sendAndReview({ status: "rejected", rejectionReason: "Falta el sello" });

    expect(document.body.textContent?.toLowerCase()).not.toContain("egres");
  });
});
