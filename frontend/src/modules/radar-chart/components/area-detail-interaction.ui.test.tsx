import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AreaDetailInteraction } from "./area-detail-interaction";

describe("AreaDetailInteraction - pruebas de UI", () => {
  afterEach(() => {
    cleanup();
  });

  it("mantiene el contenido dentro de un área con desplazamiento cuando es necesario", () => {
    render(<AreaDetailInteraction initialArea="desarrollo" />);

    const panel = screen.getByRole("region", { name: "Desarrollo" });
    const content = panel.querySelector(".overflow-y-auto");

    expect(content).not.toBeNull();
    expect(content?.className).toContain("overflow-y-auto");
  });

  it("muestra las etiquetas del área de forma legible", () => {
    render(<AreaDetailInteraction initialArea="desarrollo" />);

    const panel = screen.getByRole("region", { name: "Desarrollo" });

    expect(panel).toHaveTextContent("React");
    expect(panel).toHaveTextContent("Node.js");
    expect(panel).toHaveTextContent("Microservicios");
  });

  it("mantiene visible la brecha respecto al promedio", () => {
    render(<AreaDetailInteraction initialArea="desarrollo" />);

    const panel = screen.getByRole("region", { name: "Desarrollo" });

    expect(panel).toHaveTextContent("Brecha");
    expect(panel).toHaveTextContent("+2,3");
  });

  it("mantiene el panel preparado para adaptarse a desktop y móvil", () => {
    render(<AreaDetailInteraction initialArea="desarrollo" />);

    const panel = screen.getByRole("region", { name: "Desarrollo" });

    expect(panel.className).toContain("min-w-0");
    expect(panel.className).toContain("overflow-hidden");

    const content = panel.querySelector(".overflow-y-auto");

    expect(content?.className).toContain("grid-cols-1");
    expect(content?.className).toContain("lg:grid-cols-3");
  });

  it("conserva el panel al cambiar entre áreas", () => {
    render(<AreaDetailInteraction initialArea="desarrollo" />);

    expect(
      screen.getByRole("region", { name: "Desarrollo" }),
    ).toBeDefined();

    fireEvent.click(
      screen.getByRole("button", { name: "Cloud/DevOps" }),
    );

    expect(
      screen.getByRole("region", { name: "Cloud/DevOps" }),
    ).toBeDefined();

    expect(
      screen.queryByRole("region", { name: "Desarrollo" }),
    ).toBeNull();
  });
});