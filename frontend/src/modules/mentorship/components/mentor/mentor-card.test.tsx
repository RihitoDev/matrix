import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { MentorDirectoryItem } from "../../types/mentor-directory.types";
import { MentorCard } from "./mentor-card";

const mentor: MentorDirectoryItem = {
  id: "0424f370-00f0-43cf-9b8a-997af81840b9",
  fullName: "María Fernanda Rodríguez",
  headline: "Desarrolladora Backend Senior",
  technicalAreas: ["Backend", "APIs", "Bases de datos"],
};

afterEach(cleanup);

describe("MentorCard", () => {
  it("renderiza la información principal del mentor", () => {
    render(<MentorCard mentor={mentor} />);

    expect(screen.getByText(mentor.fullName)).toBeDefined();
    expect(screen.getByText("Desarrolladora Backend Senior")).toBeDefined();
    expect(screen.getByText("Backend")).toBeDefined();
    expect(screen.getByText("APIs")).toBeDefined();
    expect(screen.getByText("Bases de datos")).toBeDefined();
    expect(screen.queryByText("Disponible")).toBeNull();
    expect(screen.queryByText("No disponible")).toBeNull();
  });

  it("no fabrica un cargo cuando headline es null", () => {
    render(
      <MentorCard
        mentor={{
          ...mentor,
          headline: null,
        }}
      />,
    );

    expect(screen.queryByText("Desarrolladora Backend Senior")).toBeNull();
    expect(screen.queryByText("Cargo no registrado")).toBeNull();
  });

  it("renderiza múltiples áreas técnicas", () => {
    render(<MentorCard mentor={mentor} />);

    expect(screen.getByText("Backend")).toBeDefined();
    expect(screen.getByText("APIs")).toBeDefined();
    expect(screen.getByText("Bases de datos")).toBeDefined();
  });

  it("enlaza el perfil utilizando el ID correcto del mentor", () => {
    render(<MentorCard mentor={mentor} />);

    const profileLink = screen.getByRole("link", {
      name: `Ver perfil de ${mentor.fullName}`,
    });

    expect(profileLink.getAttribute("href")).toBe(
      "/mentors/0424f370-00f0-43cf-9b8a-997af81840b9",
    );
  });

  it("genera la ruta correcta para otro UUID de mentor", () => {
    render(
      <MentorCard
        mentor={{
          ...mentor,
          id: "0fa5e6de-63a4-430e-87fb-22f5eb700ecd",
          fullName: "Carlos Andrés Vargas",
        }}
      />,
    );

    const profileLink = screen.getByRole("link", {
      name: "Ver perfil de Carlos Andrés Vargas",
    });

    expect(profileLink.getAttribute("href")).toBe(
      "/mentors/0fa5e6de-63a4-430e-87fb-22f5eb700ecd",
    );
  });

  it("muestra un mensaje cuando no existen áreas técnicas", () => {
    render(
      <MentorCard
        mentor={{
          ...mentor,
          technicalAreas: [],
        }}
      />,
    );

    expect(screen.getByText("Sin áreas registradas")).toBeDefined();
  });
});
