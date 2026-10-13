import { cleanup, render, screen } from "@testing-library/react";
import { Briefcase } from "lucide-react";
import { afterEach, describe, expect, it } from "vitest";
import { AreaSection } from "./area-section";

describe("AreaSection", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the title as a level 3 heading with its content", () => {
    render(
      <AreaSection title="Experiencia" icon={Briefcase} count={3}>
        <p>Contenido de la columna</p>
      </AreaSection>,
    );

    expect(screen.getByRole("heading", { level: 3, name: "Experiencia" })).toBeDefined();
    expect(screen.getByText("Contenido de la columna")).toBeDefined();
  });

  it("shows the counter outside the heading", () => {
    render(
      <AreaSection title="Experiencia" icon={Briefcase} count={3}>
        <p>Contenido de la columna</p>
      </AreaSection>,
    );

    const heading = screen.getByRole("heading", { level: 3 });

    expect(heading.textContent).toBe("Experiencia");
    expect(screen.getByText("3")).toBeDefined();
  });
});
