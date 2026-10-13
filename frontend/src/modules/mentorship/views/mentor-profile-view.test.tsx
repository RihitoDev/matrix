import { renderWithQuery as render } from "@/shared/testing/render-with-query";
import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as service from "../services/mentor-profile.service";
import { MENTOR_PROFILE_FIXTURE } from "../testing/mentor-profile.fixture";
import { MentorProfileView } from "./mentor-profile-view";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("MentorProfileView", () => {
  it("muestra la información real del mentor", async () => {
    vi.spyOn(service, "getMentorProfile").mockResolvedValue(
      MENTOR_PROFILE_FIXTURE,
    );

    const { container } = render(
      <MentorProfileView mentorId={MENTOR_PROFILE_FIXTURE.id} />,
    );

    expect((await screen.findAllByText("Ana Rojas")).length).toBeGreaterThan(0);
    expect(screen.getByText("Arquitecta de Software")).toBeInTheDocument();
    expect(screen.getByText("Backend")).toBeInTheDocument();
    expect(screen.getByText("Arquitectura")).toBeInTheDocument();
    expect(screen.getByText("Orientación técnica")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sobre mí" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Trayectoria actual" })).toBeInTheDocument();
    expect(container.querySelector("main > div > div.grid")).toHaveClass(
      "grid-cols-1",
      "xl:grid-cols-12",
    );
  });

  it("maneja campos opcionales nulos sin inventar contenido", async () => {
    vi.spyOn(service, "getMentorProfile").mockResolvedValue({
      ...MENTOR_PROFILE_FIXTURE,
      headline: null,
      aboutMe: null,
      photoUrl: null,
      city: null,
      educations: [],
      workExperiences: [],
      skills: [],
      certifications: [],
      technicalAreas: [],
      orientationTypes: [],
    });

    render(<MentorProfileView mentorId={MENTOR_PROFILE_FIXTURE.id} />);

    expect(
      await screen.findByRole("heading", { name: "Ana Rojas" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Sobre mí")).not.toBeInTheDocument();
    expect(screen.queryByText("Trayectoria actual")).not.toBeInTheDocument();
    expect(
      screen.getByText("No hay áreas técnicas registradas."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Este mentor todavía no registró tipos de orientación."),
    ).toBeInTheDocument();
  });

  it("muestra mensaje cuando el mentor no existe", async () => {
    vi.spyOn(service, "getMentorProfile").mockResolvedValue(null);

    render(<MentorProfileView mentorId="not-a-valid-mentor-id" />);

    expect(await screen.findByText("Mentor no encontrado")).toBeInTheDocument();
    expect(
      screen.getByText("No se pudo encontrar el perfil solicitado."),
    ).toBeInTheDocument();
  });
});
