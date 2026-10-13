import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MENTOR_PROFILE_FIXTURE } from "../../testing/mentor-profile.fixture";
import { MentorAbout } from "./mentor-about";
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
  it("mantiene iniciales cuando falla la carga de la fotografía", async () => {
    vi.spyOn(window, "Image").mockImplementation(function ImageMock() {
      return { complete: true, naturalWidth: 0 } as HTMLImageElement;
    });
    render(
      <MentorProfileHeader
        mentor={{ ...MENTOR_PROFILE_FIXTURE, photoUrl: "/missing-photo" }}
      />,
    );
    await waitFor(() => expect(screen.getByText("AR")).toBeVisible());
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("actualiza la imagen y vuelve a iniciales al recibir un perfil sin foto", async () => {
    vi.spyOn(window, "Image").mockImplementation(function ImageMock() {
      return { complete: true, naturalWidth: 100 } as HTMLImageElement;
    });
    const { rerender } = render(
      <MentorProfileHeader
        mentor={{ ...MENTOR_PROFILE_FIXTURE, photoUrl: "/photo?v=1" }}
      />,
    );
    expect(await screen.findByRole("img")).toHaveAttribute("src", "/photo?v=1");
    rerender(
      <MentorProfileHeader
        mentor={{ ...MENTOR_PROFILE_FIXTURE, photoUrl: "/photo?v=2" }}
      />,
    );
    await waitFor(() =>
      expect(screen.getByRole("img")).toHaveAttribute("src", "/photo?v=2"),
    );
    rerender(<MentorProfileHeader mentor={MENTOR_PROFILE_FIXTURE} />);
    await waitFor(() => expect(screen.getByText("AR")).toBeVisible());
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

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

  it("permite ajustar etiquetas técnicas extensas", () => {
    const name = "Especialidad".repeat(30);
    render(
      <MentorTechnicalAreas
        areas={[{ ...MENTOR_PROFILE_FIXTURE.technicalAreas[0], name }]}
      />,
    );
    expect(screen.getByText(name)).toHaveClass(
      "max-w-full",
      "[overflow-wrap:anywhere]",
    );
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

  it("permite seleccionar orientaciones con teclado y omite descripciones ausentes", async () => {
    const user = userEvent.setup();
    const orientationTypes = [
      MENTOR_PROFILE_FIXTURE.orientationTypes[0],
      { ...MENTOR_PROFILE_FIXTURE.orientationTypes[1], description: null },
    ];
    render(<MentorGuidanceTypes orientationTypes={orientationTypes} />);

    const reviewCvOption = screen.getByRole("button", { name: "Revisión de CV" });
    reviewCvOption.focus();
    await user.keyboard("{Enter}");

    expect(reviewCvOption).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText("Revisión de decisiones técnicas.")).not.toBeInTheDocument();
  });

  it("permite envolver nombres y descripciones extensas de orientaciones", () => {
    const name = "Orientación".repeat(30);
    const description = "Descripción".repeat(30);
    render(
      <MentorGuidanceTypes
        orientationTypes={[
          { ...MENTOR_PROFILE_FIXTURE.orientationTypes[0], name, description },
        ]}
      />,
    );
    expect(screen.getByRole("button", { name })).toHaveClass(
      "max-w-full",
      "whitespace-normal",
      "[overflow-wrap:anywhere]",
    );
    expect(screen.getByText(description)).toHaveClass("[overflow-wrap:anywhere]");
  });

  it("muestra datos reales e iniciales cuando no existe fotografía", () => {
    const imageLoader = vi.spyOn(window, "Image");
    const { container } = render(
      <MentorProfileHeader mentor={MENTOR_PROFILE_FIXTURE} />,
    );

    expect(container.querySelector('[data-slot="avatar"]')).toBeInTheDocument();
    expect(imageLoader).not.toHaveBeenCalled();
    expect(
      container.querySelector('[data-slot="avatar-fallback"]'),
    ).toHaveTextContent("AR");
    const availability = screen.getByText("Disponible para mentoría");
    expect(availability).toHaveClass("bg-emerald-50", "text-emerald-800");
    expect(availability.querySelector('[aria-hidden="true"]')).toHaveClass(
      "bg-emerald-600",
    );
    expect(availability.parentElement).toContainElement(
      screen.getByRole("heading", { name: "Ana Rojas" }),
    );
    expect(screen.queryByText("Habilidades")).not.toBeInTheDocument();
    expect(screen.queryByText("TypeScript")).not.toBeInTheDocument();
    expect(screen.getByText("Arquitecta de Software")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="card-content"]')).toHaveClass(
      "p-4",
      "sm:p-6",
      "xl:flex-row",
    );
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
    expect(requestLink).toHaveClass("w-full", "px-4", "sm:px-6", "xl:w-auto");
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
    expect(screen.getByText("No disponible")).toHaveClass(
      "bg-surface-soft",
      "text-text-secondary",
    );
    expect(screen.queryByText("Disponible para mentoría")).not.toBeInTheDocument();
  });

  it("omite titular y formación ausentes sin inventar datos", () => {
    render(
      <MentorProfileHeader
        mentor={{ ...MENTOR_PROFILE_FIXTURE, headline: null, educations: [] }}
      />,
    );
    expect(screen.queryByText("Arquitecta de Software")).not.toBeInTheDocument();
    expect(screen.queryByText(/Licenciatura en Ingeniería de Sistemas/)).not.toBeInTheDocument();
  });

  it("ajusta nombre y titular extensos dentro del encabezado", () => {
    const fullName = "Nombre".repeat(30);
    const headline = "Especialidad".repeat(30);
    render(
      <MentorProfileHeader
        mentor={{ ...MENTOR_PROFILE_FIXTURE, fullName, headline }}
      />,
    );
    expect(screen.getByRole("heading", { name: fullName })).toHaveClass(
      "[overflow-wrap:anywhere]",
    );
    expect(screen.getByText(headline)).toHaveClass("[overflow-wrap:anywhere]");
    expect(screen.getByText("Disponible para mentoría").parentElement).toHaveClass(
      "flex-wrap",
    );
  });

  it("preserva saltos de línea y palabras largas en Sobre mí", () => {
    const description = `Primera línea\n${"Trayectoria".repeat(30)}`;
    const { container } = render(<MentorAbout description={description} />);
    const paragraph = container.querySelector('[data-slot="card-content"] p');
    expect(paragraph?.textContent).toBe(description);
    expect(paragraph).toHaveClass(
      "whitespace-pre-line",
      "[overflow-wrap:anywhere]",
    );
  });
  it("muestra la experiencia y formación entregadas por backend", () => {
    render(<MentorCareer mentor={MENTOR_PROFILE_FIXTURE} />);

    expect(screen.getByText("Tech Lead")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Trayectoria actual" })).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(
      screen.getByText("Licenciatura en Ingeniería de Sistemas"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Universidad Mayor de San Simón"),
    ).toBeInTheDocument();
  });

  it("elige la experiencia vigente entre varias experiencias", () => {
    const historicalExperience = {
      ...MENTOR_PROFILE_FIXTURE.workExperiences[0],
      id: "e95971f2-3caf-4aeb-a3d4-9ab57875129d",
      position: "Cargo histórico",
      isCurrent: false,
    };
    render(
      <MentorCareer
        mentor={{
          ...MENTOR_PROFILE_FIXTURE,
          workExperiences: [historicalExperience, MENTOR_PROFILE_FIXTURE.workExperiences[0]],
        }}
      />,
    );
    expect(screen.getByText("Tech Lead")).toBeInTheDocument();
    expect(screen.queryByText("Cargo histórico")).not.toBeInTheDocument();
  });

  it("no presenta una experiencia histórica como cargo actual", () => {
    render(
      <MentorCareer
        mentor={{
          ...MENTOR_PROFILE_FIXTURE,
          workExperiences: [
            { ...MENTOR_PROFILE_FIXTURE.workExperiences[0], isCurrent: false },
          ],
        }}
      />,
    );
    expect(screen.queryByText("Tech Lead")).not.toBeInTheDocument();
    expect(screen.queryByText("Acme")).not.toBeInTheDocument();
    expect(screen.getByText("Licenciatura en Ingeniería de Sistemas")).toBeInTheDocument();
  });

  it("muestra trayectoria solo profesional cuando no existe formación", () => {
    render(
      <MentorCareer mentor={{ ...MENTOR_PROFILE_FIXTURE, educations: [] }} />,
    );
    expect(screen.getByText("Tech Lead")).toBeInTheDocument();
    expect(screen.queryByText("Formación")).not.toBeInTheDocument();
  });

  it("muestra solo formación si no existe experiencia vigente", () => {
    render(
      <MentorCareer mentor={{ ...MENTOR_PROFILE_FIXTURE, workExperiences: [] }} />,
    );
    expect(screen.getByText("Universidad Mayor de San Simón")).toBeInTheDocument();
    expect(screen.queryByText("Cargo")).not.toBeInTheDocument();
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
