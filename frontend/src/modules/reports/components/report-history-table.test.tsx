import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { GeneratedReport, ReportType } from "../types/generated-report.types";
import { ReportHistoryTable } from "./report-history-table";

function buildReport(reportType: ReportType): GeneratedReport {
  return {
    id: reportType,
    fileName: `reporte-${reportType}.csv`,
    reportType,
    generatedAt: "2026-10-08T04:22:08.095Z",
  };
}

describe("ReportHistoryTable", () => {
  afterEach(() => {
    cleanup();
  });

  it.each<[ReportType, string]>([
    ["REGISTERED_USERS", "Lista de Usuarios"],
    ["STUDENTS", "Estudiantes"],
    ["DEGREE_HOLDERS", "Titulados"],
    ["MENTORS", "Mentores"],
    ["COMPANIES", "Empresas"],
    ["ADMINS", "Administradores"],
    ["REJECTED_USERS", "Rechazados"],
  ])("muestra el tipo %s como \"%s\"", (reportType, label) => {
    render(<ReportHistoryTable reports={[buildReport(reportType)]} isLoading={false} />);

    expect(screen.getByRole("cell", { name: label })).toBeDefined();
  });

  it("separa la fecha y la hora en bloques que no se parten por dentro", () => {
    const report = { ...buildReport("REGISTERED_USERS"), generatedAt: "2026-10-08T00:28:00" };

    render(<ReportHistoryTable reports={[report]} isLoading={false} />);

    const dateCell = screen.getByRole("cell", { name: "2026-10-08 00:28" });
    const blocks = [...dateCell.querySelectorAll("span.whitespace-nowrap")].map((block) => block.textContent);
    expect(blocks).toEqual(["2026-10-08", "00:28"]);
  });

  it("muestra un guion si la fecha no es válida", () => {
    const report = { ...buildReport("REJECTED_USERS"), generatedAt: "fecha-invalida" };

    render(<ReportHistoryTable reports={[report]} isLoading={false} />);

    expect(screen.getByRole("cell", { name: "-" })).toBeDefined();
  });

  it("muestra las tres columnas definidas, en orden", () => {
    render(<ReportHistoryTable reports={[]} isLoading={false} />);

    const headers = screen.getAllByRole("columnheader").map((header) => header.textContent);
    expect(headers).toEqual(["Nombre del Archivo/Reporte", "Tipo de Reporte", "Fecha y Hora de Generación"]);
  });
});
