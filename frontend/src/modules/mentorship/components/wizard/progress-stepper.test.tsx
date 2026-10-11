import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { ProgressStepper } from "./progress-stepper";

afterEach(cleanup);

describe("ProgressStepper", () => {
  it("renderiza los cuatro pasos de la mentoría", () => {
    render(<ProgressStepper currentStep={1} />);

    expect(screen.getByText("Participación")).toBeDefined();
    expect(screen.getByText("Áreas técnicas")).toBeDefined();
    expect(screen.getByText("Tipos de orientación")).toBeDefined();
    expect(screen.getByText("Confirmación")).toBeDefined();
  });

  it("marca el paso actual como activo", () => {
    render(<ProgressStepper currentStep={2} />);

    const activeStep = screen.getByText("2");
    expect(activeStep.getAttribute("aria-current")).toBe("step");
  });

  it("marca como completados los pasos anteriores al actual", () => {
    render(<ProgressStepper currentStep={3} />);

    expect(screen.queryByText("1")).toBeNull();
    expect(screen.queryByText("2")).toBeNull();

    const activeStep = screen.getByText("3");
    expect(activeStep.getAttribute("aria-current")).toBe("step");

    const checkIcons = document.querySelectorAll("svg");
    expect(checkIcons.length).toBe(2);
  });

  it("muestra Check en todos los pasos anteriores cuando está en el último", () => {
    render(<ProgressStepper currentStep={4} />);

    expect(screen.queryByText("1")).toBeNull();
    expect(screen.queryByText("2")).toBeNull();
    expect(screen.queryByText("3")).toBeNull();

    const activeStep = screen.getByText("4");
    expect(activeStep.getAttribute("aria-current")).toBe("step");

    const checkIcons = document.querySelectorAll("svg");
    expect(checkIcons.length).toBe(3);
  });
});
