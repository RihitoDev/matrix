import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requestReviewService } from "../services/request-review.service";
import type { ReviewListItem } from "../types/request-review.types";
import { RequestInboxView } from "./request-inbox-view";

const listRequests = vi.spyOn(requestReviewService, "listRequests");
// Las llamadas de listado llevan 2 argumentos; los conteos de las pestañas, 3 (limit=1)
const listCalls = () => listRequests.mock.calls.filter((call) => call.length === 2);

function row(index: number, status: ReviewListItem["status"] = "pending"): ReviewListItem {
  return {
    id: `id-${index}`,
    requestCode: `SOL-2026-000${index}`,
    fullName: `Persona ${index}`,
    email: `p${index}@umss.test`,
    sisCode: `20180${index}`,
    documentType: "academic_diploma",
    submittedAt: new Date().toISOString(),
    status,
  };
}

const page = (items: ReviewListItem[], total = items.length) => ({ ok: true as const, data: { items, total, page: 1, offset: 0 } });

describe("RequestInboxView", () => {
  beforeEach(() => listRequests.mockReset());
  afterEach(() => cleanup());

  it("carga la pestaña Pendientes, muestra el esqueleto y luego las filas", async () => {
    listRequests.mockResolvedValue(page([row(1), row(2)]));
    render(<RequestInboxView />);

    expect(screen.getAllByTestId("request-skeleton-row").length).toBeGreaterThan(0);
    expect(await screen.findByText("Persona 1")).toBeInTheDocument();
    expect(listCalls()).toContainEqual(["pending", 1]);
    expect(screen.getByText("Mostrando 1 a 2 de 2 solicitudes, de la más reciente a la más antigua")).toBeInTheDocument();
  });

  it("cada pestaña pide solo su estado y vuelve a la página 1", async () => {
    listRequests.mockResolvedValue(page([row(1)]));
    render(<RequestInboxView />);
    await screen.findByText("Persona 1");

    for (const [tab, status] of [["En revisión", "in_review"], ["Aprobadas", "approved"], ["Rechazadas", "rejected"]] as const) {
      fireEvent.click(screen.getByRole("tab", { name: new RegExp(`^${tab}`) }));
      await waitFor(() => expect(listCalls().at(-1)).toEqual([status, 1]));
    }
  });

  it("la paginación navega entre páginas", async () => {
    listRequests.mockResolvedValue(page(Array.from({ length: 10 }, (_, i) => row(i + 1)), 25));
    render(<RequestInboxView />);
    await screen.findByText("Persona 1");
    expect(screen.getByText("Mostrando 1 a 10 de 25 solicitudes, de la más reciente a la más antigua")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    await waitFor(() => expect(listCalls().at(-1)).toEqual(["pending", 2]));
    await screen.findByText("Mostrando 11 a 20 de 25 solicitudes, de la más reciente a la más antigua");

    fireEvent.click(screen.getByRole("button", { name: "Anterior" }));
    await waitFor(() => expect(listCalls().at(-1)).toEqual(["pending", 1]));
  });

  it("al llegar al final deshabilita Siguiente", async () => {
    listRequests.mockResolvedValue(page([row(1)], 1));
    render(<RequestInboxView />);
    await screen.findByText("Persona 1");
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
  });

  it("muestra un mensaje claro si no hay solicitudes", async () => {
    listRequests.mockResolvedValue(page([], 0));
    render(<RequestInboxView />);
    expect(await screen.findByText("No hay solicitudes en este estado.")).toBeInTheDocument();
  });

  it("muestra el error del servicio en español", async () => {
    listRequests.mockResolvedValue({ ok: false, status: 403, message: "No tienes permiso para ver las solicitudes." });
    render(<RequestInboxView />);
    expect(await screen.findByRole("alert")).toHaveTextContent("No tienes permiso para ver las solicitudes.");
  });

  describe("conteos de las pestañas", () => {
    it("pide un conteo por estado con limit=1 y lo muestra en una pastilla", async () => {
      listRequests.mockImplementation(async (status, _page, limit) =>
        limit === 1
          ? { ok: true as const, data: { items: [], total: { pending: 18, in_review: 2, approved: 146, rejected: 23 }[status], page: 1, offset: 0 } }
          : page([row(1)]),
      );
      render(<RequestInboxView />);

      expect(await screen.findByLabelText("18 solicitudes")).toHaveTextContent("18");
      expect(screen.getByLabelText("2 solicitudes")).toBeInTheDocument();
      expect(screen.getByLabelText("146 solicitudes")).toBeInTheDocument();
      expect(screen.getByLabelText("23 solicitudes")).toBeInTheDocument();
      for (const status of ["pending", "in_review", "approved", "rejected"]) {
        expect(listRequests).toHaveBeenCalledWith(status, 1, 1);
      }
    });

    it("si falla un conteo se omite solo ese y no hay error", async () => {
      listRequests.mockImplementation(async (status, _page, limit) => {
        if (limit !== 1) return page([row(1)]);
        return status === "approved"
          ? { ok: false as const, status: 0, message: "sin red" }
          : { ok: true as const, data: { items: [], total: 4, page: 1, offset: 0 } };
      });
      render(<RequestInboxView />);

      await screen.findByText("Persona 1");
      await waitFor(() => expect(screen.getAllByLabelText("4 solicitudes")).toHaveLength(3));
      expect(screen.getByRole("tab", { name: "Aprobadas" })).toBeInTheDocument();
      expect(screen.queryByRole("alert")).toBeNull();
    });

    it("la cabecera y la pestaña activa siguen el diseño", async () => {
      listRequests.mockResolvedValue(page([row(1)]));
      render(<RequestInboxView />);

      expect(screen.getByRole("heading", { name: "Solicitudes de acceso" })).toBeInTheDocument();
      expect(screen.getByText("Revisa el documento de cada solicitante y emite tu dictamen.")).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /^Pendientes/ })).toHaveClass("after:bg-accent");
      await screen.findByText("Persona 1");
    });
  });

  it("estructura: el contenedor raíz y la tarjeta ocupan todo el ancho disponible sin desbordar", async () => {
    listRequests.mockResolvedValue(page([row(1)]));
    const { container } = render(<RequestInboxView />);
    await screen.findByText("Persona 1");

    expect(container.firstElementChild).toHaveClass("w-full", "min-w-0");
    const card = container.querySelector(".rounded-\\[10px\\].border");
    expect(card).toHaveClass("w-full", "min-w-0", "overflow-hidden");
    expect(container.querySelector("[data-slot='table-container']")).toHaveClass("w-full", "overflow-x-auto");
    expect(container.querySelector("section")).toHaveClass("p-8");
  });
});
