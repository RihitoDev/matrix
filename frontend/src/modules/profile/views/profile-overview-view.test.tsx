import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { profileService } from "../services/profile.service";
import type { ProfileResponse } from "../types/profile-response.types";
import { ProfileOverviewView } from "./profile-overview-view";

vi.mock("../services/profile-photo.service", () => ({
  profilePhotoService: {
    getPhoto: vi.fn().mockResolvedValue(null),
    uploadPhoto: vi.fn(),
  },
}));

vi.mock("../services/profile.service", () => ({
  profileService: {
    getProfile: vi.fn(),
  },
}));

const NEW_PROFILE: ProfileResponse = {
  id: "11111111-1111-4111-8111-111111111111",
  firstName: "Valeria",
  lastName: "Quispe",
  institutionalEmail: "valeria.quispe@umss.edu.bo",
  personalEmail: null,
  phone: null,
  city: null,
  headline: null,
  aboutMe: null,
  updatedAt: "2026-10-04T12:00:00.000Z",
};

const COMPLETE_PROFILE: ProfileResponse = {
  ...NEW_PROFILE,
  personalEmail: "valeria@correo.com",
  phone: "+591 70000000",
  city: { id: "22222222-2222-4222-8222-222222222222", title: "Cochabamba" },
  headline: "Desarrolladora web junior",
  aboutMe: "Systems engineering graduate from UMSS.",
};

describe("ProfileOverviewView", () => {
  beforeEach(() => {
    vi.mocked(profileService.getProfile).mockResolvedValue(COMPLETE_PROFILE);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the profile page without an active tab", async () => {
    render(<ProfileOverviewView />);

    expect(screen.getByRole("heading", { level: 1, name: "Mi perfil" })).toBeInTheDocument();
    await screen.findByText("Valeria Quispe");
    for (const link of screen.getAllByRole("link", { name: /Datos personales|Presentación|Trayectoria/ })) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });

  it("shows a loading message while the profile is requested", () => {
    vi.mocked(profileService.getProfile).mockReturnValue(new Promise(() => {}));

    render(<ProfileOverviewView />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando tu perfil...");
  });

  it("invites the user to complete a new profile", async () => {
    vi.mocked(profileService.getProfile).mockResolvedValue(NEW_PROFILE);

    render(<ProfileOverviewView />);

    expect(await screen.findByText("Valeria Quispe")).toBeInTheDocument();
    expect(screen.getByText(/Completa tu perfil/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Completar perfil" })).toHaveAttribute(
      "href",
      "/profile/personal-info",
    );
    expect(screen.getByText("Aún no agregaste un titular profesional")).toBeInTheDocument();
    expect(screen.getAllByText("Sin registrar")).toHaveLength(3);
    expect(screen.getByText("Cuenta quién eres y en qué te especializas.")).toBeInTheDocument();
  });

  it("shows the registered data of a complete profile", async () => {
    render(<ProfileOverviewView />);

    expect(await screen.findByText("Valeria Quispe")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByText("VQ")).toBeInTheDocument();
    expect(screen.getByText("Desarrolladora web junior")).toBeInTheDocument();
    expect(screen.getByText("Cochabamba")).toBeInTheDocument();
    expect(screen.getByText("+591 70000000")).toBeInTheDocument();
    expect(screen.getByText("valeria@correo.com")).toBeInTheDocument();
    expect(screen.getByText("Systems engineering graduate from UMSS.")).toBeInTheDocument();
  });

  it("links each section to its edit page", async () => {
    render(<ProfileOverviewView />);

    expect(
      await screen.findByRole("link", { name: "Editar datos personales" }),
    ).toHaveAttribute("href", "/profile/personal-info");
    expect(screen.getByRole("link", { name: "Editar presentación profesional" })).toHaveAttribute(
      "href",
      "/profile/presentation",
    );
  });

  it("shows an error when the profile cannot be loaded", async () => {
    vi.mocked(profileService.getProfile).mockRejectedValue({ response: { status: 401 } });

    render(<ProfileOverviewView />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Tu sesión no es válida. Inicia sesión nuevamente.",
    );
  });
});
