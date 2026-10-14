import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { VacanciesView } from "./vacancies-view";

// Simulacion del hook personalizado para evitar llamadas reales al backend
vi.mock("../hooks/use-vacancies", () => ({
  useVacancies: () => ({
    search: "",
    setSearch: vi.fn(),
    filteredVacancies: [
      {
        id: "1",
        cargo: "Desarrollador Frontend",
        empresa: "UMSS",
        descripcion: "Desarrollo de PWA con Next.js",
        salario: "Bs. 5000",
        ubicacion: "Cochabamba",
        tipoContrato: "Tiempo completo",
        jornada: "Diurna",
        requisitos: ["React", "TypeScript"],
      },
    ],
  }),
}));

describe("VacanciesView Component", () => {
  it("Debe renderizar el titulo principal de vacantes", () => {
    render(<VacanciesView />);
    expect(screen.getByText("Vacantes")).toBeInTheDocument();
  });

  it("Debe mostrar la informacion de la tarjeta de vacante correctamente", () => {
    render(<VacanciesView />);
    const titles = screen.getAllByText("Desarrollador Frontend");
    expect(titles[0]).toBeInTheDocument();
    const companies = screen.getAllByText("UMSS");
    expect(companies[0]).toBeInTheDocument();
  });
});
