import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EMPTY_PERSONAL_INFO_VALUES } from "../config/profile-form-defaults.config";
import { PROFILE_VALIDATION_MESSAGES } from "../constants/profile-validation.constants";
import type { PersonalInfoValues } from "../types/personal-info-values.types";
import { PersonalInfoForm } from "./personal-info-form";

const CITIES = [
  { id: "city-cbba", title: "Cochabamba" },
  { id: "city-lpz", title: "La Paz" },
];

const SAVED_VALUES: PersonalInfoValues = {
  firstName: "Valeria",
  lastName: "Quispe",
  cityId: "city-cbba",
  phone: "+591 70000000",
  personalEmail: "valeria@correo.com",
};

function renderForm(initialValues = EMPTY_PERSONAL_INFO_VALUES, isSaving = false) {
  const onSubmit = vi.fn();
  render(
    <PersonalInfoForm
      initialValues={initialValues}
      cities={CITIES}
      isSaving={isSaving}
      onSubmit={onSubmit}
    />,
  );
  return { onSubmit, user: userEvent.setup() };
}

describe("PersonalInfoForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the personal information card with all the fields", async () => {
    const { user } = renderForm();

    expect(screen.getByText("Tu información personal")).toBeInTheDocument();
    expect(screen.getByText("Fotografía de perfil")).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombres/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Apellidos/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo personal/)).toBeInTheDocument();
    expect(screen.getByText("* Campos obligatorios")).toBeInTheDocument();

    await user.click(screen.getByRole("combobox", { name: /Ciudad de residencia/ }));

    expect(await screen.findByRole("option", { name: "Cochabamba" })).toBeInTheDocument();
  }, 15000);

  it("shows the initial values", () => {
    renderForm(SAVED_VALUES);

    expect(screen.getByLabelText(/Nombres/)).toHaveValue("Valeria");
    expect(screen.getByRole("combobox", { name: /Ciudad de residencia/ })).toHaveTextContent(
      "Cochabamba",
    );
    expect(screen.getByLabelText(/Correo personal/)).toHaveValue("valeria@correo.com");
  });

  it("submits the trimmed values", async () => {
    const { onSubmit, user } = renderForm();

    await user.type(screen.getByLabelText(/Nombres/), "  Valeria ");
    await user.type(screen.getByLabelText(/Apellidos/), "Quispe");
    await user.click(screen.getByRole("combobox", { name: /Ciudad de residencia/ }));
    await user.click(await screen.findByRole("option", { name: "La Paz" }));
    await user.type(screen.getByLabelText(/Teléfono/), "+591 71234567");
    await user.type(screen.getByLabelText(/Correo personal/), "valeria@correo.com");
    await user.click(screen.getByRole("button", { name: "Guardar perfil" }));

    expect(onSubmit).toHaveBeenCalledWith({
      firstName: "Valeria",
      lastName: "Quispe",
      cityId: "city-lpz",
      phone: "+591 71234567",
      personalEmail: "valeria@correo.com",
    });
  }, 15000);

  it("shows an error next to each empty required field and does not submit", async () => {
    const { onSubmit, user } = renderForm();

    await user.type(screen.getByLabelText(/Nombres/), "   ");
    await user.click(screen.getByRole("button", { name: "Guardar perfil" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getAllByText(PROFILE_VALIDATION_MESSAGES.required)).toHaveLength(4);
    expect(screen.getByText(PROFILE_VALIDATION_MESSAGES.cityRequired)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombres/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/Nombres/)).toHaveAccessibleDescription(
      PROFILE_VALIDATION_MESSAGES.required,
    );
  });

  it("shows format errors for the phone and the email", async () => {
    const { onSubmit, user } = renderForm({
      ...SAVED_VALUES,
      phone: "123",
      personalEmail: "valeria",
    });

    await user.click(screen.getByRole("button", { name: "Guardar perfil" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Teléfono/)).toHaveAccessibleDescription(
      PROFILE_VALIDATION_MESSAGES.invalidPhone,
    );
    expect(screen.getByLabelText(/Correo personal/)).toHaveAccessibleDescription(
      PROFILE_VALIDATION_MESSAGES.invalidEmail,
    );
  });

  it("clears the error of a field when it changes", async () => {
    const { user } = renderForm({ ...SAVED_VALUES, personalEmail: "valeria" });

    await user.click(screen.getByRole("button", { name: "Guardar perfil" }));
    await user.type(screen.getByLabelText(/Correo personal/), "@correo.com");

    expect(screen.queryByText(PROFILE_VALIDATION_MESSAGES.invalidEmail)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Correo personal/)).toHaveAttribute("aria-invalid", "false");
  });

  it("restores the initial values and clears the errors when cancelling", async () => {
    const { user } = renderForm(SAVED_VALUES);

    await user.clear(screen.getByLabelText(/Nombres/));
    await user.click(screen.getByRole("button", { name: "Guardar perfil" }));
    await user.type(screen.getByLabelText(/Nombres/), "Another name");
    await user.clear(screen.getByLabelText(/Apellidos/));
    await user.click(screen.getByRole("button", { name: "Guardar perfil" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.getByLabelText(/Nombres/)).toHaveValue("Valeria");
    expect(screen.queryByText(PROFILE_VALIDATION_MESSAGES.required)).not.toBeInTheDocument();
  });

  it("disables the form while saving", () => {
    renderForm(SAVED_VALUES, true);

    expect(screen.getByLabelText(/Nombres/)).toBeDisabled();
    expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });
});
