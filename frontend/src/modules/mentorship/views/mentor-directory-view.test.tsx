import { renderWithQuery as render } from "@/shared/testing/render-with-query";
import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { profileService } from "@/modules/profile/services/profile.service";
import { saveAccessToken, clearAccessToken } from "@/shared/services/storage/access-token-storage";
import * as directoryService from "../services/mentor-directory.service";
import { MentorDirectoryView } from "./mentor-directory-view";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  clearAccessToken();
});

const ownId = "0424f370-00f0-43cf-9b8a-997af81840b9";
const otherId = "0fa5e6de-63a4-430e-87fb-22f5eb700ecd";
const mentors = [
  {
    id: ownId,
    fullName: "María Fernanda Rodríguez",
    headline: "Desarrolladora Backend Senior",
    technicalAreas: ["Backend"],
    photoUrl: null,
    education: null,
    isAvailable: true,
    orientationTypes: ["Orientación técnica"],
  },
  {
    id: otherId,
    fullName: "Carlos Vargas",
    headline: null,
    technicalAreas: [],
    photoUrl: null,
    education: null,
    isAvailable: false,
    orientationTypes: [],
  },
];

describe("MentorDirectoryView", () => {
  it("renderiza el encabezado del directorio", () => {
    vi.spyOn(directoryService, "getMentorDirectory").mockResolvedValue([]);
    render(<MentorDirectoryView />);

    expect(
      screen.getByRole("heading", {
        name: "Encuentra un mentor",
      }),
    ).toBeDefined();
  });

  it("renderiza enlaces hacia los perfiles de los mentores", async () => {
    vi.spyOn(directoryService, "getMentorDirectory").mockResolvedValue([
      {
        id: "0424f370-00f0-43cf-9b8a-997af81840b9",
        fullName: "María Fernanda Rodríguez",
        headline: "Desarrolladora Backend Senior",
        technicalAreas: ["Backend"],
        photoUrl: null,
        education: null,
        isAvailable: false,
        orientationTypes: [],
      },
    ]);
    render(<MentorDirectoryView />);

    expect(
      (await screen.findAllByRole("link", {
        name: /Ver perfil de/i,
      })).length,
    ).toBeGreaterThan(0);
  });

  it("distingue la tarjeta propia por UUID sin repetir la consulta de identidad", async () => {
    saveAccessToken("test-token");
    vi.spyOn(directoryService, "getMentorDirectory").mockResolvedValue(mentors);
    const getProfile = vi.spyOn(profileService, "getProfile").mockResolvedValue({
      id: ownId,
      firstName: "María",
      lastName: "Rodríguez",
      institutionalEmail: "maria@example.test",
      personalEmail: null,
      phone: null,
      city: null,
      headline: null,
      aboutMe: null,
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    render(<MentorDirectoryView />);

    const ownLink = await screen.findByRole("link", { name: "Ver mi perfil de María Fernanda Rodríguez" });
    const otherLink = screen.getByRole("link", { name: "Ver perfil de Carlos Vargas" });
    expect(ownLink).toHaveTextContent("Ver mi perfil");
    expect(ownLink).toHaveAttribute("href", `/mentors/${ownId}`);
    expect(otherLink).toHaveTextContent("Ver perfil");
    expect(otherLink).toHaveAttribute("href", `/mentors/${otherId}`);
    expect(screen.getByText("Disponible para mentoría")).toBeInTheDocument();
    expect(screen.getByText("No disponible")).toBeInTheDocument();
    expect(screen.getByText("Orientación técnica")).toBeInTheDocument();
    expect(getProfile).toHaveBeenCalledTimes(1);
  });

  it("conserva el directorio público sin sesión", async () => {
    vi.spyOn(directoryService, "getMentorDirectory").mockResolvedValue(mentors);
    const getProfile = vi.spyOn(profileService, "getProfile");

    render(<MentorDirectoryView />);

    expect(await screen.findAllByRole("link", { name: /Ver perfil de/ })).toHaveLength(2);
    expect(screen.queryByText("Ver mi perfil")).not.toBeInTheDocument();
    expect(getProfile).not.toHaveBeenCalled();
  });
  it("combines accent-insensitive search, area and availability filters and can reset them",async()=>{
    vi.spyOn(directoryService,"getMentorDirectory").mockResolvedValue(mentors);
    render(<MentorDirectoryView />);
    await screen.findByRole("link",{name:/Ver perfil de María/});
    fireEvent.change(screen.getByRole("searchbox",{name:"Buscar mentor"}),{target:{value:"maria"}});
    expect(screen.queryByRole("link",{name:/Ver perfil de Carlos/})).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox",{name:"Área"}),{target:{value:"Backend"}});
    fireEvent.click(screen.getByRole("checkbox",{name:"Con disponibilidad"}));
    expect(screen.getByRole("link",{name:/Ver perfil de María/})).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox",{name:"Buscar mentor"}),{target:{value:"noexiste"}});
    expect(screen.getByText("No hay mentores con estos filtros")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button",{name:"Limpiar filtros"})[0]);
    expect(screen.getByRole("link",{name:/Ver perfil de Carlos/})).toBeInTheDocument();
  });

});
