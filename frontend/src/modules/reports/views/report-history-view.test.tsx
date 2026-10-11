import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiResponse, PaginatedData } from "@/shared/types/api-response.types";
import { reportsService } from "../services/reports.service";
import type { GeneratedReport } from "../types/generated-report.types";
import { ReportHistoryView } from "./report-history-view";

const FIRST_PAGE_REPORT = "Lista_Usuarios_Activos_2026";
const SECOND_PAGE_REPORT = "Rechazados_Julio_2026";
const COLUMN_HEADERS = ["Nombre del Archivo/Reporte", "Tipo de Reporte", "Fecha y Hora de Generación"];

function getColumnHeaders(): string[] {
  return screen.getAllByRole("columnheader").map((header) => header.textContent ?? "");
}

function getBodyRows(): HTMLElement[] {
  return screen.getAllByRole("row").slice(1);
}

function getFileName(index: number): string {
  if (index === 0) return FIRST_PAGE_REPORT;
  if (index === 10) return SECOND_PAGE_REPORT;
  return `Reporte_Generado_${index + 1}`;
}

const GENERATED_REPORTS: GeneratedReport[] = Array.from({ length: 12 }, (_, index) => ({
  id: `report-${index + 1}`,
  fileName: getFileName(index),
  reportType: index === 0 ? "REGISTERED_USERS" : "REJECTED_USERS",
  generatedAt: index === 0 ? "2026-09-28T19:45:00" : "2026-09-18T08:40:00",
}));

function buildResponse(page: number, limit: number): ApiResponse<PaginatedData<GeneratedReport>> {
  const offset = (page - 1) * limit;

  return {
    statusCode: 200,
    data: { items: GENERATED_REPORTS.slice(offset, offset + limit), totalItems: GENERATED_REPORTS.length },
    page,
    detail: "Historial de reportes obtenido correctamente",
    ok: true,
  };
}

describe("ReportHistoryView", () => {
  beforeEach(() => {
    vi.spyOn(reportsService, "getReportHistory").mockImplementation(async ({ page, limit }) =>
      buildResponse(page, limit),
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("muestra el título, el breadcrumb y los reportes de la primera página", async () => {
    render(<ReportHistoryView />);

    expect(screen.getByRole("heading", { name: "Historial de Reportes Generados" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Inicio" })).toBeDefined();
    expect(screen.getAllByTestId("skeleton-row")).toHaveLength(10);

    await waitFor(() => {
      expect(screen.getByText(FIRST_PAGE_REPORT)).toBeDefined();
    });
    expect(screen.getByText("Lista de Usuarios")).toBeDefined();
    expect(screen.getAllByText("Rechazados").length).toBeGreaterThan(0);
    expect(screen.getByRole("cell", { name: "2026-09-28 19:45" })).toBeDefined();
    expect(screen.queryByText(SECOND_PAGE_REPORT)).toBeNull();
    expect(reportsService.getReportHistory).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it("la ruta de navegación identifica la ubicación del historial (CA 35)", () => {
    render(<ReportHistoryView />);

    const breadcrumb = screen.getByRole("navigation", { name: "Ruta de navegación" });
    const steps = within(breadcrumb)
      .getAllByRole("listitem")
      .map((item) => item.textContent);

    expect(steps).toEqual(["Inicio", "Reportes Analíticos", "Historial de reportes generados"]);
    expect(within(breadcrumb).getByRole("link", { name: "Inicio" }).getAttribute("href")).toBe("/backoffice");
    expect(within(breadcrumb).getByText("Historial de reportes generados").getAttribute("aria-current")).toBe("page");
  });

  it("muestra las columnas en el orden definido y una fila independiente por reporte", async () => {
    render(<ReportHistoryView />);
    await waitFor(() => {
      expect(screen.getByText(FIRST_PAGE_REPORT)).toBeDefined();
    });

    expect(screen.getByRole("table")).toBeDefined();
    expect(getColumnHeaders()).toEqual(COLUMN_HEADERS);

    const rows = getBodyRows();
    expect(rows).toHaveLength(10);

    const firstRowCells = within(rows[0]).getAllByRole("cell").map((cell) => cell.textContent);
    expect(firstRowCells).toEqual([FIRST_PAGE_REPORT, "Lista de Usuarios", "2026-09-28 19:45"]);
  });

  it("cambia de página con la paginación", async () => {
    render(<ReportHistoryView />);
    await waitFor(() => {
      expect(screen.getByText(FIRST_PAGE_REPORT)).toBeDefined();
    });

    expect(screen.getByRole("button", { name: "Página anterior" }).hasAttribute("disabled")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));

    await waitFor(() => {
      expect(screen.getByText(SECOND_PAGE_REPORT)).toBeDefined();
    });
    expect(screen.queryByText(FIRST_PAGE_REPORT)).toBeNull();
    expect(getColumnHeaders()).toEqual(COLUMN_HEADERS);
    expect(getBodyRows()).toHaveLength(2);
    expect(reportsService.getReportHistory).toHaveBeenLastCalledWith({ page: 2, limit: 10 });
    expect(screen.getByRole("button", { name: "Página 2" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("button", { name: "Página siguiente" }).hasAttribute("disabled")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Página anterior" }));
    await waitFor(() => {
      expect(screen.getByText(FIRST_PAGE_REPORT)).toBeDefined();
    });
  });

  it("muestra un mensaje cuando no hay reportes", async () => {
    vi.spyOn(reportsService, "getReportHistory").mockResolvedValueOnce({
      statusCode: 200,
      data: { items: [], totalItems: 0 },
      detail: "Sin datos",
      ok: true,
    });

    render(<ReportHistoryView />);

    await waitFor(() => {
      expect(screen.getByText("Aún no se generaron reportes.")).toBeDefined();
    });
  });

  it("muestra un mensaje de error si falla la carga", async () => {
    vi.spyOn(reportsService, "getReportHistory").mockRejectedValueOnce(new Error("Network error"));

    render(<ReportHistoryView />);

    await waitFor(() => {
      expect(screen.getByText("No se pudo cargar el historial de reportes.")).toBeDefined();
    });
  });

  describe("filtro por tipo de reporte", () => {
    async function selectReportType(label: string) {
      const user = userEvent.setup();
      await user.click(screen.getByRole("combobox", { name: "Tipo de reporte" }));
      await user.click(await screen.findByRole("option", { name: label }));
    }

    it("pide al backend solo el tipo elegido y vuelve a la primera página", async () => {
      render(<ReportHistoryView />);
      await waitFor(() => {
        expect(screen.getByText(FIRST_PAGE_REPORT)).toBeDefined();
      });

      fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));
      await waitFor(() => {
        expect(screen.getByText(SECOND_PAGE_REPORT)).toBeDefined();
      });

      await selectReportType("Rechazados");

      await waitFor(() => {
        expect(reportsService.getReportHistory).toHaveBeenLastCalledWith({
          page: 1,
          limit: 10,
          reportType: "REJECTED_USERS",
        });
      });
      expect(screen.getByRole("button", { name: "Página 1" }).getAttribute("aria-current")).toBe("page");
    });

    it("al volver a \"Todos\" pide de nuevo todos los tipos", async () => {
      render(<ReportHistoryView />);
      await waitFor(() => {
        expect(screen.getByText(FIRST_PAGE_REPORT)).toBeDefined();
      });

      await selectReportType("Mentores");
      await selectReportType("Todos");

      await waitFor(() => {
        expect(reportsService.getReportHistory).toHaveBeenLastCalledWith({ page: 1, limit: 10, reportType: undefined });
      });
    });

    it("muestra un mensaje si no hay reportes del tipo elegido", async () => {
      render(<ReportHistoryView />);
      await waitFor(() => {
        expect(screen.getByText(FIRST_PAGE_REPORT)).toBeDefined();
      });

      vi.spyOn(reportsService, "getReportHistory").mockResolvedValue({
        statusCode: 200,
        data: { items: [], totalItems: 0 },
        detail: "Sin datos",
        ok: true,
      });
      await selectReportType("Administradores");

      await waitFor(() => {
        expect(screen.getByText("No hay reportes generados de este tipo.")).toBeDefined();
      });
    });
  });
});
