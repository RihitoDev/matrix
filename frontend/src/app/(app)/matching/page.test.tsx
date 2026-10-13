import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import MatchingPage from "./page";

vi.mock("@/modules/matching/components/radar-chart", () => ({
  RadarChart: () => (
    <div data-testid="matching-radar-chart">
      Radar de compatibilidad
    </div>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("MatchingPage", () => {
  it("renderiza la pantalla principal de matching", () => {
    render(<MatchingPage />);

    expect(
      screen.getByRole("heading", {
        name: "Buscar candidatos por afinidad",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Tech Lead",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Data Scientist Sr.",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "DevOps Engineer",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/6 candidatos/i),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("matching-radar-chart"),
    ).toBeInTheDocument();
  });

  it("filtra candidatos mediante el buscador", () => {
    render(<MatchingPage />);

    const searchInput = screen.getByRole("searchbox", {
      name: "Buscar candidato",
    });

    fireEvent.change(searchInput, {
      target: {
        value: "Carlos",
      },
    });

    expect(
      screen.getByText(/1 candidato/i),
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(/Carlos Mendoza/i).length,
    ).toBeGreaterThan(0);

    expect(
      screen.queryByText(/Lucía Flores/i),
    ).not.toBeInTheDocument();
  });

  it("muestra el estado vacío cuando no existen coincidencias", () => {
    render(<MatchingPage />);

    const searchInput = screen.getByRole("searchbox", {
      name: "Buscar candidato",
    });

    fireEvent.change(searchInput, {
      target: {
        value: "candidato inexistente",
      },
    });

    expect(
      screen.getByText(
        /No se encontraron candidatos para "candidato inexistente"/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Selecciona un candidato de la lista para ver su detalle.",
      ),
    ).toBeInTheDocument();
  });

  it("actualiza el perfil objetivo al cambiar de vacante", () => {
    render(<MatchingPage />);

    expect(
      screen.getByText(/Compatibilidad vs\. Tech Lead/i),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Data Scientist Sr.",
      }),
    );

    expect(
      screen.getByText(
        /Compatibilidad vs\. Data Scientist Sr\./i,
      ),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "DevOps Engineer",
      }),
    );

    expect(
      screen.getByText(
        /Compatibilidad vs\. DevOps Engineer/i,
      ),
    ).toBeInTheDocument();
  });
});