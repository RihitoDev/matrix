import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReportTypeFilter } from "./report-type-filter";

describe("ReportTypeFilter", () => {
  afterEach(() => {
    cleanup();
  });

  it("muestra \"Todos\" cuando no hay filtro aplicado", () => {
    render(<ReportTypeFilter onChange={vi.fn()} />);

    expect(screen.getByRole("combobox", { name: "Tipo de reporte" }).textContent).toContain("Todos");
  });

  it("ofrece \"Todos\" y los siete tipos de reporte, en orden", async () => {
    render(<ReportTypeFilter onChange={vi.fn()} />);

    await userEvent.setup().click(screen.getByRole("combobox", { name: "Tipo de reporte" }));

    const options = (await screen.findAllByRole("option")).map((option) => option.textContent);
    expect(options).toEqual([
      "Todos",
      "Lista de Usuarios",
      "Estudiantes",
      "Titulados",
      "Mentores",
      "Empresas",
      "Administradores",
      "Rechazados",
    ]);
  });

  it("informa el tipo elegido", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ReportTypeFilter onChange={onChange} />);

    await user.click(screen.getByRole("combobox", { name: "Tipo de reporte" }));
    await user.click(await screen.findByRole("option", { name: "Mentores" }));

    expect(onChange).toHaveBeenCalledWith("MENTORS");
  });

  it("informa undefined al volver a \"Todos\"", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ReportTypeFilter value="MENTORS" onChange={onChange} />);

    expect(screen.getByRole("combobox", { name: "Tipo de reporte" }).textContent).toContain("Mentores");

    await user.click(screen.getByRole("combobox", { name: "Tipo de reporte" }));
    await user.click(await screen.findByRole("option", { name: "Todos" }));

    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
