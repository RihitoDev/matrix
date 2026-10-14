import { renderWithQuery as render } from "@/shared/testing/render-with-query";
import { cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { profileService } from "@/modules/profile/services/profile.service";
import { clearAccessToken, saveAccessToken } from "@/shared/services/storage/access-token-storage";

import * as service from "../services/mentor-profile.service";
import { MENTOR_PROFILE_FIXTURE } from "../testing/mentor-profile.fixture";
import { MentorProfileView } from "./mentor-profile-view";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  clearAccessToken();
});

function mockCurrentUser(id: string) {
  return vi.spyOn(profileService, "getProfile").mockResolvedValue({
    id,
    firstName: "Ana",
    lastName: "Rojas",
    institutionalEmail: "ana@example.test",
    personalEmail: null,
    phone: null,
    city: null,
    headline: null,
    aboutMe: null,
    updatedAt: "2026-01-01T00:00:00.000Z",
  });
}

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

  it.each([true, false])("oculta la solicitud en el perfil propio con disponibilidad %s", async (isAvailable) => {
    saveAccessToken("test-token");
    mockCurrentUser(MENTOR_PROFILE_FIXTURE.id);
    vi.spyOn(service, "getMentorProfile").mockResolvedValue({
      ...MENTOR_PROFILE_FIXTURE,
      isAvailable,
    });

    const { client } = render(<MentorProfileView mentorId={MENTOR_PROFILE_FIXTURE.id} />);

    expect(await screen.findByRole("heading", { name: "Ana Rojas" })).toBeInTheDocument();
    await waitFor(() => expect(client.getQueryState(["mentorship", "current-user", "test-token"])?.status).toBe("success"));
    expect(profileService.getProfile).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Solicitar mentoría")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sobre mí" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Trayectoria actual" })).toBeInTheDocument();
    expect(screen.getByText(isAvailable ? "Disponible para mentoría" : "No disponible")).toBeInTheDocument();
  });

  it("conserva la acción y la ruta de otro mentor disponible", async () => {
    saveAccessToken("test-token");
    mockCurrentUser("0fa5e6de-63a4-430e-87fb-22f5eb700ecd");
    vi.spyOn(service, "getMentorProfile").mockResolvedValue(MENTOR_PROFILE_FIXTURE);

    render(<MentorProfileView mentorId={MENTOR_PROFILE_FIXTURE.id} />);

    expect(await screen.findByRole("link", { name: "Solicitar mentoría" })).toHaveAttribute(
      "href",
      `/mentors/${MENTOR_PROFILE_FIXTURE.id}/availability`,
    );
  });

  it("mantiene deshabilitada la acción de otro mentor no disponible", async () => {
    saveAccessToken("test-token");
    mockCurrentUser("0fa5e6de-63a4-430e-87fb-22f5eb700ecd");
    vi.spyOn(service, "getMentorProfile").mockResolvedValue({
      ...MENTOR_PROFILE_FIXTURE,
      isAvailable: false,
    });

    render(<MentorProfileView mentorId={MENTOR_PROFILE_FIXTURE.id} />);

    expect(await screen.findByRole("button", { name: "Solicitar mentoría" })).toBeDisabled();
  });

  it("no muestra la solicitud mientras se resuelve la identidad", async () => {
    saveAccessToken("test-token");
    let resolveProfile: (value: Awaited<ReturnType<typeof profileService.getProfile>>) => void = () => {};
    vi.spyOn(profileService, "getProfile").mockImplementation(() => new Promise((resolve) => {
      resolveProfile = resolve;
    }));
    vi.spyOn(service, "getMentorProfile").mockResolvedValue(MENTOR_PROFILE_FIXTURE);

    const { client } = render(<MentorProfileView mentorId={MENTOR_PROFILE_FIXTURE.id} />);

    expect(await screen.findByRole("heading", { name: "Ana Rojas" })).toBeInTheDocument();
    expect(screen.queryByText("Solicitar mentoría")).not.toBeInTheDocument();
    resolveProfile({
      id: MENTOR_PROFILE_FIXTURE.id,
      firstName: "Ana",
      lastName: "Rojas",
      institutionalEmail: "ana@example.test",
      personalEmail: null,
      phone: null,
      city: null,
      headline: null,
      aboutMe: null,
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    await waitFor(() => expect(client.getQueryState(["mentorship", "current-user", "test-token"])?.status).toBe("success"));
    expect(profileService.getProfile).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Solicitar mentoría")).not.toBeInTheDocument();
  });

  it("no habilita solicitudes si falla la consulta de identidad", async () => {
    saveAccessToken("test-token");
    vi.spyOn(profileService, "getProfile").mockRejectedValue(new Error("invalid session"));
    vi.spyOn(service, "getMentorProfile").mockResolvedValue(MENTOR_PROFILE_FIXTURE);

    const { client } = render(<MentorProfileView mentorId={MENTOR_PROFILE_FIXTURE.id} />);

    expect(await screen.findByRole("heading", { name: "Ana Rojas" })).toBeInTheDocument();
    await waitFor(() => expect(client.getQueryState(["mentorship", "current-user", "test-token"])?.status).toBe("error"));
    expect(profileService.getProfile).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Solicitar mentoría")).not.toBeInTheDocument();
  });
});
