import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MENTOR_PROFILE_FIXTURE } from "../../testing/mentor-profile.fixture";
import { MentorCareer } from "./mentor-career";
import { MentorGuidanceTypes } from "./mentor-guidance-types";
import { MentorProfileHeader } from "./mentor-profile-header";
import { MentorTechnicalAreas } from "./mentor-technical-areas";
import { MentorProfileNavigation } from "./mentor-profile-navigation";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Mentor profile components", () => {
  it("muestra mensaje cuando no existen áreas técnicas", () => {
    render(<MentorTechnicalAreas areas={[]} />);

    expect(
      screen.getByText("No hay áreas técnicas registradas."),
    ).toBeInTheDocument();
  });

  it("permite volver al directorio de mentores", () => {
    render(<MentorProfileNavigation mentorName="Ana Rojas" />);

    const backLink = screen.getByRole("link", {
      name: "Volver al directorio",
    });

    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/mentorship/mentors");
  });

  it("muestra todas las áreas técnicas reales", () => {
    render(
      <MentorTechnicalAreas areas={MENTOR_PROFILE_FIXTURE.technicalAreas} />,
    );

    expect(screen.getByText("Backend")).toBeInTheDocument();
    expect(screen.getByText("Arquitectura")).toBeInTheDocument();
  });

  it("muestra mensaje cuando no existen tipos de orientación", () => {
    const { container } = render(
      <MentorGuidanceTypes orientationTypes={[]} />,
    );

    expect(
      screen.getByText("Este mentor todavía no registró tipos de orientación."),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="toggle-group"]'),
    ).not.toBeInTheDocument();
  });

  it("muestra los tipos de orientación registrados", () => {
    render(
      <MentorGuidanceTypes
        orientationTypes={MENTOR_PROFILE_FIXTURE.orientationTypes}
      />,
    );

    expect(screen.getByText("Revisión de CV")).toBeInTheDocument();
    expect(screen.getByText("Orientación técnica")).toBeInTheDocument();
  });

  it("actualiza la descripción al seleccionar un tipo de orientación", () => {
    const { container } = render(
      <MentorGuidanceTypes
        orientationTypes={MENTOR_PROFILE_FIXTURE.orientationTypes}
      />,
    );

    const technicalGuidanceOption = screen.getByRole("button", {
      name: "Orientación técnica",
    });
    const reviewCvOption = screen.getByRole("button", {
      name: "Revisión de CV",
    });

    expect(container.querySelector('[data-slot="toggle-group"]')).toHaveAttribute(
      "aria-label",
      "Tipos de orientación",
    );
    expect(technicalGuidanceOption).toHaveAttribute(
      "data-slot",
      "toggle-group-item",
    );
    expect(technicalGuidanceOption).toHaveAttribute("aria-pressed", "true");
    expect(reviewCvOption).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByText("Revisión de decisiones técnicas."),
    ).toBeInTheDocument();

    fireEvent.click(reviewCvOption);

    expect(technicalGuidanceOption).toHaveAttribute("aria-pressed", "false");
    expect(reviewCvOption).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByText("Revisión del contenido y estructura del currículum."),
    ).toBeInTheDocument();
  });

  it("muestra datos reales e iniciales cuando no existe fotografía", () => {
    const { container } = render(
      <MentorProfileHeader mentor={MENTOR_PROFILE_FIXTURE} />,
    );

    expect(container.querySelector('[data-slot="avatar"]')).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="avatar-fallback"]'),
    ).toHaveTextContent("AR");
    expect(screen.getByText("Habilidades")).toBeInTheDocument();
    ["TypeScript", "Arquitectura de software"].forEach((skill) => {
      expect(screen.getByText(skill)).toHaveAttribute("data-slot", "badge");
    });
    expect(
      screen.getByText(/Licenciatura en Ingeniería de Sistemas/),
    ).toBeInTheDocument();
  });

  it("permite solicitar mentoría cuando el mentor está disponible", () => {
    render(<MentorProfileHeader mentor={MENTOR_PROFILE_FIXTURE} />);

    const requestLink = screen.getByRole("link", {
      name: "Solicitar mentoría",
    });

    expect(requestLink).toHaveAttribute(
      "href",
      `/mentors/${MENTOR_PROFILE_FIXTURE.id}/availability`,
    );
  });

  it("deshabilita la solicitud cuando el mentor no está disponible", () => {
    render(
      <MentorProfileHeader
        mentor={{
          ...MENTOR_PROFILE_FIXTURE,
          isAvailable: false,
        }}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Solicitar mentoría" }),
    ).toBeDisabled();
  });
  it("muestra la experiencia y formación entregadas por backend", () => {
    render(<MentorCareer mentor={MENTOR_PROFILE_FIXTURE} />);

    expect(screen.getByText("Tech Lead")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(
      screen.getByText("Licenciatura en Ingeniería de Sistemas"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Universidad Mayor de San Simón"),
    ).toBeInTheDocument();
  });

  it("omite trayectoria cuando backend no devuelve datos relacionados", () => {
    const { container } = render(
      <MentorCareer
        mentor={{
          ...MENTOR_PROFILE_FIXTURE,
          educations: [],
          workExperiences: [],
        }}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("muestra la fotografía cuando el mentor tiene una imagen", async () => {
    const mentorWithImage = {
      ...MENTOR_PROFILE_FIXTURE,
      photoUrl: "/mentor-test.jpg",
    };

    vi.spyOn(window, "Image").mockImplementation(function ImageMock() {
      return {
        complete: true,
        naturalWidth: 100,
      } as HTMLImageElement;
    });

    const { container } = render(
      <MentorProfileHeader mentor={mentorWithImage} />,
    );

    const image = await screen.findByRole("img", {
      name: `Foto de ${mentorWithImage.fullName}`,
    });
    expect(image).toHaveAttribute("src", "/mentor-test.jpg");
    expect(image).toHaveAttribute("data-slot", "avatar-image");
    expect(container.querySelector('[data-slot="avatar"]')).toContainElement(
      image,
    );
  });
});
