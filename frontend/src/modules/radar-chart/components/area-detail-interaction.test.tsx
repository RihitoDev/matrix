import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AREA_DETAILS } from "../data/area-details.data";
import { AreaDetailInteraction } from "./area-detail-interaction";

describe("AreaDetailInteraction - validación funcional", () => {
  afterEach(() => {
    cleanup();
  });

  it("muestra la información correspondiente al área seleccionada", () => {
    render(<AreaDetailInteraction />);

    fireEvent.click(screen.getByRole("button", { name: "Desarrollo" }));

    expect(
      screen.getByRole("region", { name: "Desarrollo" }),
    ).toBeDefined();

    expect(screen.getByText("8,5")).toBeDefined();
    expect(screen.getByText("/ 10")).toBeDefined();
    expect(screen.getByText(AREA_DETAILS.desarrollo.courses[0].name)).toBeDefined();
    expect(screen.getByText(AREA_DETAILS.desarrollo.tags[0])).toBeDefined();
  });

  it("actualiza la información al cambiar de área", () => {
    render(<AreaDetailInteraction />);

    fireEvent.click(screen.getByRole("button", { name: "Desarrollo" }));

    expect(
      screen.getByRole("region", { name: "Desarrollo" }),
    ).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Ciberseguridad" }));

    expect(
      screen.getByRole("region", { name: "Ciberseguridad" }),
    ).toBeDefined();

    expect(screen.queryByRole("region", { name: "Desarrollo" })).toBeNull();

    expect(screen.getByText("4,5")).toBeDefined();
    expect(screen.getByText("/ 10")).toBeDefined();
    expect(
      screen.getByText(AREA_DETAILS.ciberseguridad.courses[0].name),
    ).toBeDefined();
  });

  it.each([
    "desarrollo",
    "cloud-devops",
    "data-ai",
    "qa",
    "ciberseguridad",
    "gobernanza-ti",
  ] as const)("muestra datos propios para el área %s", (areaId) => {
    render(<AreaDetailInteraction />);

    const area = AREA_DETAILS[areaId];

    fireEvent.click(screen.getByRole("button", { name: area.name }));

    const panel = screen.getByRole("region", { name: area.name });

   expect(panel.textContent).toContain(
  area.score.toFixed(1).replace(".", ","),
);
    expect(panel.textContent).toContain(area.courses[0].name);
    expect(panel.textContent).toContain(area.certifications[0].name);
    expect(panel.textContent).toContain(area.experience[0].company);
    expect(panel.textContent).toContain(area.tags[0]);
  });
});