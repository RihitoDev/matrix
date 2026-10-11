import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { profileService } from "../services/profile.service";
import type { ProfileResponse } from "../types/profile-response.types";
import { PersonalInfoView } from "./personal-info-view";
import { PresentationView } from "./presentation-view";

vi.mock("../services/profile-photo.service", () => ({
  profilePhotoService: {
    getPhoto: vi.fn().mockResolvedValue(null),
    uploadPhoto: vi.fn(),
  },
}));

vi.mock("../services/profile.service", () => ({
  profileService: {
    getProfile: vi.fn(),
    getCities: vi.fn(),
    updatePersonalInfo: vi.fn(),
    updatePresentation: vi.fn(),
  },
}));

const COCHABAMBA = { id: "22222222-2222-4222-8222-222222222222", title: "Cochabamba" };
const LA_PAZ = { id: "33333333-3333-4333-8333-333333333333", title: "La Paz" };

const SAVED_PROFILE: ProfileResponse = {
  id: "11111111-1111-4111-8111-111111111111",
  firstName: "Valeria",
  lastName: "Quispe",
  institutionalEmail: "valeria.quispe@umss.edu.bo",
  personalEmail: "valeria@correo.com",
  phone: "+591 70000000",
  city: COCHABAMBA,
  headline: "Desarrolladora web junior",
  aboutMe: "Systems engineering graduate from UMSS.",
  updatedAt: "2026-10-04T12:00:00.000Z",
};

beforeEach(() => {
  vi.mocked(profileService.getProfile).mockResolvedValue(SAVED_PROFILE);
  vi.mocked(profileService.getCities).mockResolvedValue([COCHABAMBA, LA_PAZ]);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("PersonalInfoView", () => {
  it("loads the saved personal information of the user", async () => {
    render(<PersonalInfoView />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Datos personales y contacto" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Datos personales" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(await screen.findByLabelText(/Nombres/)).toHaveValue("Valeria");
    expect(screen.getByLabelText(/Teléfono/)).toHaveValue("+591 70000000");
    expect(screen.getByLabelText(/Correo personal/)).toHaveValue("valeria@correo.com");
  });

  it("saves the edited data and shows a confirmation", async () => {
    const user = userEvent.setup();
    vi.mocked(profileService.updatePersonalInfo).mockResolvedValue({
      ...SAVED_PROFILE,
      phone: "+591 71111111",
      city: LA_PAZ,
    });
    render(<PersonalInfoView />);

    const phoneInput = await screen.findByLabelText(/Teléfono/);
    await user.clear(phoneInput);
    await user.type(phoneInput, "+591 71111111");
    await user.click(screen.getByRole("combobox", { name: /Ciudad de residencia/ }));
    await user.click(await screen.findByRole("option", { name: "La Paz" }));
    await user.click(screen.getByRole("button", { name: "Guardar perfil" }));

    expect(profileService.updatePersonalInfo).toHaveBeenCalledWith({
      firstName: "Valeria",
      lastName: "Quispe",
      cityId: LA_PAZ.id,
      phone: "+591 71111111",
      personalEmail: "valeria@correo.com",
    });
    expect(
      await screen.findByText("Tus datos personales se guardaron correctamente."),
    ).toBeInTheDocument();
  }, 15000);

  it("restores the saved values when cancelling after saving", async () => {
    const user = userEvent.setup();
    vi.mocked(profileService.updatePersonalInfo).mockResolvedValue({
      ...SAVED_PROFILE,
      firstName: "Valeria Andrea",
    });
    render(<PersonalInfoView />);

    const firstNameInput = await screen.findByLabelText(/Nombres/);
    await user.type(firstNameInput, " Andrea");
    await user.click(screen.getByRole("button", { name: "Guardar perfil" }));
    await screen.findByText("Tus datos personales se guardaron correctamente.");
    await user.type(firstNameInput, " changed");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(firstNameInput).toHaveValue("Valeria Andrea");
  });

  it("shows the server error when saving fails", async () => {
    const user = userEvent.setup();
    vi.mocked(profileService.updatePersonalInfo).mockRejectedValue({ response: { status: 404 } });
    render(<PersonalInfoView />);

    await screen.findByLabelText(/Nombres/);
    await user.click(screen.getByRole("button", { name: "Guardar perfil" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No encontramos tu perfil o la ciudad elegida. Recarga la página.",
    );
  });

  it("shows an error instead of the form when the profile cannot be loaded", async () => {
    vi.mocked(profileService.getProfile).mockRejectedValue(new Error("Network error"));

    render(<PersonalInfoView />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo cargar tu perfil. Recarga la página para intentarlo de nuevo.",
    );
    expect(screen.queryByRole("button", { name: "Guardar perfil" })).not.toBeInTheDocument();
  });

  it("warns when the cities cannot be loaded", async () => {
    vi.mocked(profileService.getCities).mockRejectedValue(new Error("Network error"));

    render(<PersonalInfoView />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudieron cargar las ciudades. Recarga la página para intentarlo de nuevo.",
    );
  });
});

describe("PresentationView", () => {
  it("loads the saved presentation with the name of the user", async () => {
    render(<PresentationView />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Presentación profesional" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Presentación" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(await screen.findByLabelText(/Titular profesional/)).toHaveValue(
      "Desarrolladora web junior",
    );
    expect(screen.getByText("Valeria Quispe")).toBeInTheDocument();
  });

  it("saves only the stored fields and shows a confirmation", async () => {
    const user = userEvent.setup();
    vi.mocked(profileService.updatePresentation).mockResolvedValue({
      ...SAVED_PROFILE,
      headline: "Desarrolladora frontend",
    });
    render(<PresentationView />);

    const headlineInput = await screen.findByLabelText(/Titular profesional/);
    await user.clear(headlineInput);
    await user.type(headlineInput, "Desarrolladora frontend");
    await user.type(screen.getByLabelText(/Oportunidades que me interesan/), "Remote work");
    await user.click(screen.getByRole("button", { name: "Guardar presentación" }));

    expect(profileService.updatePresentation).toHaveBeenCalledWith({
      headline: "Desarrolladora frontend",
      aboutMe: "Systems engineering graduate from UMSS.",
    });
    expect(await screen.findByText("Tu presentación se guardó correctamente.")).toBeInTheDocument();
    expect(screen.getByLabelText(/Oportunidades que me interesan/)).toHaveValue("Remote work");
  });

  it("shows the server field errors in Spanish next to each field", async () => {
    const user = userEvent.setup();
    vi.mocked(profileService.updatePresentation).mockRejectedValue({
      response: {
        status: 400,
        data: {
          statusCode: 400,
          data: [{ field: "headline", message: "Too big: expected string to have <=150 characters" }],
          detail: "headline: Too big",
          ok: false,
        },
      },
    });
    render(<PresentationView />);

    await screen.findByLabelText(/Titular profesional/);
    await user.click(screen.getByRole("button", { name: "Guardar presentación" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Revisa los datos ingresados e inténtalo de nuevo.",
    );
    expect(screen.getByLabelText(/Titular profesional/)).toHaveAccessibleDescription(
      "Ingresa un titular con hasta 150 caracteres.",
    );
    expect(screen.queryByText(/Too big/)).not.toBeInTheDocument();
  });

  it("restores the saved values when cancelling after saving", async () => {
    const user = userEvent.setup();
    vi.mocked(profileService.updatePresentation).mockResolvedValue(SAVED_PROFILE);
    render(<PresentationView />);

    const headlineInput = await screen.findByLabelText(/Titular profesional/);
    await user.click(screen.getByRole("button", { name: "Guardar presentación" }));
    await screen.findByText("Tu presentación se guardó correctamente.");
    await user.type(headlineInput, " changed");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(headlineInput).toHaveValue("Desarrolladora web junior");
  });

  it("shows a generic error when saving fails", async () => {
    const user = userEvent.setup();
    vi.mocked(profileService.updatePresentation).mockRejectedValue(new Error("Network error"));
    render(<PresentationView />);

    await screen.findByLabelText(/Titular profesional/);
    await user.click(screen.getByRole("button", { name: "Guardar presentación" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudieron guardar tus datos. Inténtalo de nuevo.",
    );
  });

  it("shows an error when the profile cannot be loaded", async () => {
    vi.mocked(profileService.getProfile).mockRejectedValue(new Error("Network error"));

    render(<PresentationView />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo cargar tu perfil. Recarga la página para intentarlo de nuevo.",
    );
  });
});
