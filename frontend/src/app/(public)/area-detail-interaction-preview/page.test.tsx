import type { ReactNode } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import AreaDetailInteractionPreviewPage from "./page";

vi.mock("@/modules/radar-chart/components/epic3-shell", () => ({
  Epic3Shell: ({ children }: { children: ReactNode }) => children,
}));

describe("AreaDetailInteractionPreviewPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renderiza la vista de prueba de interacción", () => {
    render(<AreaDetailInteractionPreviewPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Prueba de interacción del detalle por área",
      }),
    ).toBeInTheDocument();
  });

  it("muestra Desarrollo inicialmente", () => {
    render(<AreaDetailInteractionPreviewPage />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Desarrollo",
      }),
    ).toBeInTheDocument();
  });

  it("permite seleccionar otra área", () => {
    render(<AreaDetailInteractionPreviewPage />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Data/AI",
      }),
    );

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Data/AI",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        level: 2,
        name: "Desarrollo",
      }),
    ).not.toBeInTheDocument();
  });

  it("permite cerrar el detalle seleccionado", () => {
    render(<AreaDetailInteractionPreviewPage />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Cerrar detalle del área/i,
      }),
    );

    expect(
      screen.getByText(
        "Selecciona un área para ver su detalle.",
      ),
    ).toBeInTheDocument();
  });
});