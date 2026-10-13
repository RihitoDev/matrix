import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requestReviewService } from "../services/request-review.service";
import type { ReviewListItem } from "../types/request-review.types";
import { RequestInboxView } from "./request-inbox-view";

const listRequests = vi.spyOn(requestReviewService, "listRequests");
const getSummary = vi.spyOn(requestReviewService, "getSummary");

const SUMMARY = {
  pendingCount: 3,
  pendingOver24hCount: 1,
  decidedTodayCount: 0,
  approvedTodayCount: 0,
  rejectedTodayCount: 0,
  averageReviewHours: null,
  reviewTimeGoalHours: 48,
  rejectedThisMonthCount: 0,
  topRejectionReason: null,
};

function row(index: number): ReviewListItem {
  return {
    id: `id-${index}`,
    requestCode: `SOL-2026-000${index}`,
    fullName: `Persona ${index}`,
    email: `p${index}@umss.test`,
    sisCode: `20180${index}`,
    documentType: "academic_diploma",
    submittedAt: new Date().toISOString(),
    status: "pending",
  };
}

const page = (items: ReviewListItem[], total = items.length) => ({ ok: true as const, data: { items, total, page: 1, offset: 0 } });
const listCalls = () => listRequests.mock.calls.filter((call) => call[2] === undefined).map((call) => [call[0], call[1], call[3]]);
const lastCall = () => listCalls().at(-1);
const EMPTY_FILTERS = { search: "", career: "", period: "all" };

describe("RequestInboxView: filtros y resumen", () => {
  beforeEach(() => {
    listRequests.mockReset();
    getSummary.mockReset();
    getSummary.mockResolvedValue({ ok: true, data: SUMMARY });
    listRequests.mockResolvedValue(page([row(1)]));
  });
  afterEach(() => cleanup());

  it("al inicio pide la pestaña Pendientes sin filtros y con el período Todo el período", async () => {
    render(<RequestInboxView />);
    await screen.findByText("Persona 1");

    expect(lastCall()).toEqual(["pending", 1, EMPTY_FILTERS]);
    expect(screen.getByRole("combobox", { name: "Período" })).toHaveTextContent("Todo el período");
    expect(screen.getByRole("combobox", { name: "Carrera" })).toHaveTextContent("Todas las carreras");
  });

  it("los controles tienen etiqueta accesible", async () => {
    render(<RequestInboxView />);
    await screen.findByText("Persona 1");

    expect(screen.getByLabelText("Buscar por nombre, C.I. o código SIS")).toHaveAttribute("placeholder", "Nombre, CI o código SIS");
    expect(screen.getByRole("combobox", { name: "Carrera" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Período" })).toBeInTheDocument();
  });

  it("la búsqueda espera 300 ms de pausa antes de pedir y envía el texto recortado", async () => {
    const user = userEvent.setup();
    render(<RequestInboxView />);
    await screen.findByText("Persona 1");
    const callsBefore = listCalls().length;

    await user.type(screen.getByLabelText("Buscar por nombre, C.I. o código SIS"), "  ana ");
    expect(listCalls().length).toBe(callsBefore);

    await waitFor(() => expect(lastCall()).toEqual(["pending", 1, { ...EMPTY_FILTERS, search: "ana" }]));
    expect(listCalls().length).toBe(callsBefore + 1);
  });

  it("con un solo carácter no filtra por texto", async () => {
    const user = userEvent.setup();
    render(<RequestInboxView />);
    await screen.findByText("Persona 1");

    await user.type(screen.getByLabelText("Buscar por nombre, C.I. o código SIS"), "a");
    await new Promise((resolve) => setTimeout(resolve, 450));

    expect(lastCall()).toEqual(["pending", 1, EMPTY_FILTERS]);
  });

  it("el filtro de carrera envía el nombre exacto de la carrera", async () => {
    const user = userEvent.setup();
    render(<RequestInboxView />);
    await screen.findByText("Persona 1");

    await user.click(screen.getByRole("combobox", { name: "Carrera" }));
    await user.click(await screen.findByRole("option", { name: "Licenciatura Ingeniería en Informática" }));

    await waitFor(() => expect(lastCall()).toEqual(["pending", 1, { ...EMPTY_FILTERS, career: "Licenciatura Ingeniería en Informática" }]));
  });

  it.each([
    ["7 días", "7d"],
    ["30 días", "30d"],
  ])("el filtro de período %s envía %s", async (label, period) => {
    const user = userEvent.setup();
    render(<RequestInboxView />);
    await screen.findByText("Persona 1");

    await user.click(screen.getByRole("combobox", { name: "Período" }));
    await user.click(await screen.findByRole("option", { name: label }));

    await waitFor(() => expect(lastCall()).toEqual(["pending", 1, { ...EMPTY_FILTERS, period }]));
  });

  it("al cambiar un filtro vuelve a la página 1 y al paginar conserva los filtros", async () => {
    const user = userEvent.setup();
    listRequests.mockResolvedValue(page(Array.from({ length: 10 }, (_, i) => row(i + 1)), 25));
    render(<RequestInboxView />);
    await screen.findByText("Persona 1");

    await user.click(screen.getByRole("combobox", { name: "Período" }));
    await user.click(await screen.findByRole("option", { name: "7 días" }));
    await waitFor(() => expect(lastCall()).toEqual(["pending", 1, { ...EMPTY_FILTERS, period: "7d" }]));
    await screen.findByText("Persona 1");

    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    await waitFor(() => expect(lastCall()).toEqual(["pending", 2, { ...EMPTY_FILTERS, period: "7d" }]));
    await screen.findByText("Persona 1");

    await user.click(screen.getByRole("combobox", { name: "Período" }));
    await user.click(await screen.findByRole("option", { name: "30 días" }));
    await waitFor(() => expect(lastCall()).toEqual(["pending", 1, { ...EMPTY_FILTERS, period: "30d" }]));
  });

  it("al cambiar de pestaña conserva los filtros y vuelve a la página 1", async () => {
    const user = userEvent.setup();
    render(<RequestInboxView />);
    await screen.findByText("Persona 1");
    await user.click(screen.getByRole("combobox", { name: "Período" }));
    await user.click(await screen.findByRole("option", { name: "7 días" }));
    await waitFor(() => expect(lastCall()?.[2]).toEqual({ ...EMPTY_FILTERS, period: "7d" }));

    await user.click(screen.getByRole("tab", { name: /^Aprobadas/ }));

    await waitFor(() => expect(lastCall()).toEqual(["approved", 1, { ...EMPTY_FILTERS, period: "7d" }]));
  });

  it("sin resultados con filtros muestra el mensaje y Limpiar filtros los restablece", async () => {
    const user = userEvent.setup();
    listRequests.mockImplementation(async (_status, _page, limit, filters) =>
      limit === 1 || filters?.period === "all" ? page([row(1)]) : page([], 0),
    );
    render(<RequestInboxView />);
    await screen.findByText("Persona 1");
    expect(screen.queryByRole("button", { name: "Limpiar filtros" })).toBeNull();

    await user.click(screen.getByRole("combobox", { name: "Período" }));
    await user.click(await screen.findByRole("option", { name: "7 días" }));
    expect(await screen.findByText("No hay solicitudes que coincidan con los filtros.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Limpiar filtros" }));

    expect(await screen.findByText("Persona 1")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Período" })).toHaveTextContent("Todo el período");
    expect(screen.getByRole("combobox", { name: "Carrera" })).toHaveTextContent("Todas las carreras");
    expect(lastCall()).toEqual(["pending", 1, EMPTY_FILTERS]);
  });

  it("sin filtros y sin resultados no ofrece Limpiar filtros", async () => {
    listRequests.mockResolvedValue(page([], 0));
    render(<RequestInboxView />);

    expect(await screen.findByText("No hay solicitudes en este estado.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Limpiar filtros" })).toBeNull();
  });

  it("limpiar los filtros también vacía el buscador", async () => {
    const user = userEvent.setup();
    listRequests.mockImplementation(async (_status, _page, limit, filters) =>
      limit === 1 || !filters?.search ? page([row(1)]) : page([], 0),
    );
    render(<RequestInboxView />);
    await screen.findByText("Persona 1");
    const input = screen.getByLabelText("Buscar por nombre, C.I. o código SIS");

    await user.type(input, "zzz");
    await user.click(await screen.findByRole("button", { name: "Limpiar filtros" }));

    expect(input).toHaveValue("");
    expect(await screen.findByText("Persona 1")).toBeInTheDocument();
  });

  it("muestra las tarjetas de resumen con los datos del servicio", async () => {
    render(<RequestInboxView />);

    expect(await screen.findByText("Pendientes de dictamen")).toBeInTheDocument();
    expect(screen.getByText("1 lleva más de 24 h")).toBeInTheDocument();
    expect(screen.getByText("Sin datos")).toBeInTheDocument();
    expect(screen.getByText("Meta: menos de 48 h")).toBeInTheDocument();
  });

  it("si el resumen falla muestra el error y Reintentar lo pide de nuevo sin afectar la lista", async () => {
    const user = userEvent.setup();
    getSummary.mockResolvedValueOnce({ ok: false, status: 0, message: "No se pudo conectar con el servidor. Inténtalo de nuevo." });
    render(<RequestInboxView />);

    expect(await screen.findByText("No se pudo conectar con el servidor. Inténtalo de nuevo.")).toBeInTheDocument();
    expect(await screen.findByText("Persona 1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByText("Pendientes de dictamen")).toBeInTheDocument();
    expect(getSummary).toHaveBeenCalledTimes(2);
  });
  it("cambiar de pestaña o de filtro no vuelve a pedir el resumen ni muestra su esqueleto", async () => {
    const user = userEvent.setup();
    render(<RequestInboxView />);
    await screen.findByText("Pendientes de dictamen");

    await user.click(screen.getByRole("tab", { name: /^Aprobadas/ }));
    await waitFor(() => expect(lastCall()?.[0]).toBe("approved"));
    expect(screen.queryByTestId("summary-skeleton")).toBeNull();
    await user.click(screen.getByRole("tab", { name: /^Rechazadas/ }));
    await user.click(screen.getByRole("combobox", { name: "Período" }));
    await user.click(await screen.findByRole("option", { name: "7 días" }));
    await waitFor(() => expect(lastCall()).toEqual(["rejected", 1, { ...EMPTY_FILTERS, period: "7d" }]));

    expect(getSummary).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("summary-skeleton")).toBeNull();
  });

  it("el popup de Carrera crece con sus opciones y las opciones fijan texto tinta al resaltarse", async () => {
    const user = userEvent.setup();
    render(<RequestInboxView />);
    await screen.findByText("Persona 1");

    await user.click(screen.getByRole("combobox", { name: "Carrera" }));
    const option = await screen.findByRole("option", { name: "Licenciatura en Ingeniería de Sistemas" });

    expect(option.className).toContain("focus:text-ink");
    expect(option.className).toContain("not-data-[variant=destructive]:focus:**:text-ink");
    expect(option.className).not.toContain("focus:text-accent-foreground");
    const popup = screen.getByRole("listbox").closest("[data-slot='select-content']");
    expect(popup?.className).toContain("w-max");
    expect(popup?.className).toContain("min-w-(--anchor-width)");
    expect(popup?.className).not.toMatch(/(^|\s)w-\(--anchor-width\)/);
  });
});
