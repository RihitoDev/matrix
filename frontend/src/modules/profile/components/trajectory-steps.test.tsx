import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TrajectorySteps } from "./trajectory-steps";

describe("TrajectorySteps", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ["Formación académica", "/profile/trajectory/education"],
    ["Experiencia laboral", "/profile/trajectory/experience"],
    ["Habilidades", "/profile/trajectory/skills"],
    ["Certificaciones", "/profile/trajectory/certifications"],
  ])("links %s to its page", (label, href) => {
    render(<TrajectorySteps activeStep="skills" />);

    expect(screen.getByRole("link", { name: new RegExp(label) })).toHaveAttribute("href", href);
  });

  it("marks only the active step", () => {
    render(<TrajectorySteps activeStep="certifications" />);

    const list = screen.getByRole("list", { name: "Sub-secciones de trayectoria" });
    const activeSteps = within(list)
      .getAllByRole("listitem")
      .filter((item) => item.getAttribute("aria-current") === "step");

    expect(activeSteps).toHaveLength(1);
    expect(activeSteps[0]).toHaveTextContent("Certificaciones");
  });

  it("marks the education step when no active step is given", () => {
    render(<TrajectorySteps />);

    expect(screen.getByText("Formación académica").closest("li")).toHaveAttribute(
      "aria-current",
      "step",
    );
  });
});
