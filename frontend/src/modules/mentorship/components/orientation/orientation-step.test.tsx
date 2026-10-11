import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OrientationStep } from "./orientation-step";
import type { OrientationTypeResponse } from "../../types/orientation-type-response.types";

afterEach(cleanup);

const ORIENTATION_TYPES: OrientationTypeResponse[] = [
  {
    id: "career-guidance",
    name: "Orientación profesional",
    description: null,
  },
  {
    id: "technical-guidance",
    name: "Orientación técnica",
    description: null,
  },
  {
    id: "job-search",
    name: "Búsqueda de empleo",
    description: null,
  },
  {
    id: "interview-preparation",
    name: "Preparación para entrevistas",
    description: null,
  },
];

describe("OrientationStep", () => {
  it("muestra las opciones de orientación", () => {
    render(
      <OrientationStep
        orientationTypes={ORIENTATION_TYPES}
        selectedOrientationTypeIds={[]}
        onSelectionChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Orientación profesional")).toBeDefined();
    expect(screen.getByText("Orientación técnica")).toBeDefined();
    expect(screen.getByText("Búsqueda de empleo")).toBeDefined();
    expect(
      screen.getByText("Preparación para entrevistas"),
    ).toBeDefined();
  });

  it("muestra el contador en cero inicialmente", () => {
    render(
      <OrientationStep
        orientationTypes={ORIENTATION_TYPES}
        selectedOrientationTypeIds={[]}
        onSelectionChange={vi.fn()}
      />,
    );

    expect(screen.getByText("0 seleccionadas")).toBeDefined();
  });

  it("muestra el mensaje de validación cuando no hay orientaciones seleccionadas", () => {
    render(
      <OrientationStep
        orientationTypes={ORIENTATION_TYPES}
        selectedOrientationTypeIds={[]}
        onSelectionChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Debe seleccionarse al menos un tipo de orientación para continuar",
    );
  });

  it("agrega una orientación al seleccionarla", () => {
    const onSelectionChange = vi.fn();

    render(
      <OrientationStep
        orientationTypes={ORIENTATION_TYPES}
        selectedOrientationTypeIds={[]}
        onSelectionChange={onSelectionChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /Orientación profesional/i,
      }),
    );

    expect(onSelectionChange).toHaveBeenCalledWith([
      "career-guidance",
    ]);
  });

  it("quita una orientación si ya estaba seleccionada", () => {
    const onSelectionChange = vi.fn();

    render(
      <OrientationStep
        orientationTypes={ORIENTATION_TYPES}
        selectedOrientationTypeIds={[
          "career-guidance",
          "technical-guidance",
        ]}
        onSelectionChange={onSelectionChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /Orientación profesional/i,
      }),
    );

    expect(onSelectionChange).toHaveBeenCalledWith([
      "technical-guidance",
    ]);
  });

  it("marca visualmente una orientación seleccionada", () => {
    render(
      <OrientationStep
        orientationTypes={ORIENTATION_TYPES}
        selectedOrientationTypeIds={["career-guidance"]}
        onSelectionChange={vi.fn()}
      />,
    );

    const selectedButton = screen.getByRole("button", {
      name: /Orientación profesional/i,
    });

    expect(selectedButton.getAttribute("aria-pressed")).toBe("true");
  });

  it("actualiza visualmente el contador según las selecciones recibidas", () => {
    render(
      <OrientationStep
        orientationTypes={ORIENTATION_TYPES}
        selectedOrientationTypeIds={[
          "career-guidance",
          "technical-guidance",
        ]}
        onSelectionChange={vi.fn()}
      />,
    );

    expect(screen.getByText("2 seleccionadas")).toBeDefined();
  });

  it("oculta el mensaje de validación cuando existe una selección", () => {
    render(
      <OrientationStep
        orientationTypes={ORIENTATION_TYPES}
        selectedOrientationTypeIds={["career-guidance"]}
        onSelectionChange={vi.fn()}
      />,
    );

    expect(screen.queryByRole("alert")).toBeNull();
  });
});
