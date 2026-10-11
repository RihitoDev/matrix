import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EMPTY_PRESENTATION_VALUES } from "../config/profile-form-defaults.config";
import { PROFILE_VALIDATION_MESSAGES } from "../constants/profile-validation.constants";
import type { PresentationValues } from "../types/presentation-values.types";
import { PresentationForm } from "./presentation-form";

const SAVED_VALUES: PresentationValues = {
  headline: "Desarrolladora web junior",
  aboutMe: "Systems engineering graduate from UMSS.",
  interestedOpportunities: "",
};

function renderForm(initialValues = EMPTY_PRESENTATION_VALUES, fullName = "", isSaving = false) {
  const onSubmit = vi.fn();
  render(
    <PresentationForm
      initialValues={initialValues}
      fullName={fullName}
      isSaving={isSaving}
      onSubmit={onSubmit}
    />,
  );
  return { onSubmit, user: userEvent.setup() };
}

describe("PresentationForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the form, the preview and the writing tips", () => {
    renderForm();

    expect(screen.getByText("Escribe tu presentación")).toBeInTheDocument();
    expect(screen.getByText("Así se verá en tu perfil")).toBeInTheDocument();
    expect(screen.getByText("Para escribirla mejor")).toBeInTheDocument();
    expect(screen.getByText("Tu nombre")).toBeInTheDocument();
    expect(screen.getByText("Tu titular profesional")).toBeInTheDocument();
    expect(
      screen.getByText("Aquí se mostrará tu presentación una vez que la guardes."),
    ).toBeInTheDocument();
  });

  it("updates the preview while typing", async () => {
    const { user } = renderForm(EMPTY_PRESENTATION_VALUES, "Valeria Quispe");

    await user.type(screen.getByLabelText(/Titular profesional/), "Desarrolladora web junior");
    await user.type(screen.getByLabelText(/Oportunidades que me interesan/), "Remote work");

    expect(screen.getByText("Valeria Quispe")).toBeInTheDocument();
    expect(screen.getByText("VQ")).toBeInTheDocument();
    expect(screen.getByText("Desarrolladora web junior")).toBeInTheDocument();
    expect(screen.getByText("Remote work", { selector: "p" })).toBeInTheDocument();
  });

  it("shows the server field errors next to their fields", () => {
    render(
      <PresentationForm
        initialValues={EMPTY_PRESENTATION_VALUES}
        fullName=""
        serverErrors={{ headline: "Ingresa un titular con hasta 150 caracteres." }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/Titular profesional/)).toHaveAccessibleDescription(
      "Ingresa un titular con hasta 150 caracteres.",
    );
  });

  it("rejects a headline longer than 150 characters", async () => {
    const { onSubmit, user } = renderForm();

    await user.type(screen.getByLabelText(/Titular profesional/), "a".repeat(151));
    await user.type(screen.getByLabelText(/Acerca de/), "Graduate.");
    await user.click(screen.getByRole("button", { name: "Guardar presentación" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Titular profesional/)).toHaveAccessibleDescription(
      PROFILE_VALIDATION_MESSAGES.headlineTooLong,
    );
  });

  it("submits the trimmed values", async () => {
    const { onSubmit, user } = renderForm();

    await user.type(screen.getByLabelText(/Titular profesional/), " Desarrolladora web junior ");
    await user.type(screen.getByLabelText(/Acerca de/), "Graduate from UMSS.");
    await user.click(screen.getByRole("button", { name: "Guardar presentación" }));

    expect(onSubmit).toHaveBeenCalledWith({
      headline: "Desarrolladora web junior",
      aboutMe: "Graduate from UMSS.",
      interestedOpportunities: "",
    });
  });

  it("shows an error next to each empty required field and does not submit", async () => {
    const { onSubmit, user } = renderForm();

    await user.type(screen.getByLabelText(/Oportunidades que me interesan/), "Remote work");
    await user.click(screen.getByRole("button", { name: "Guardar presentación" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Titular profesional/)).toHaveAccessibleDescription(
      PROFILE_VALIDATION_MESSAGES.required,
    );
    expect(screen.getByLabelText(/Acerca de/)).toHaveAccessibleDescription(
      PROFILE_VALIDATION_MESSAGES.required,
    );
    expect(screen.getByLabelText(/Oportunidades que me interesan/)).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("clears the errors when cancelling", async () => {
    const { user } = renderForm();

    await user.click(screen.getByRole("button", { name: "Guardar presentación" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByText(PROFILE_VALIDATION_MESSAGES.required)).not.toBeInTheDocument();
  });

  it("restores the initial values when cancelling", async () => {
    const { user } = renderForm(SAVED_VALUES);

    await user.clear(screen.getByLabelText(/Titular profesional/));
    await user.type(screen.getByLabelText(/Titular profesional/), "Another headline");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.getByLabelText(/Titular profesional/)).toHaveValue("Desarrolladora web junior");
  });

  it("disables the form while saving", () => {
    renderForm(SAVED_VALUES, "Valeria Quispe", true);

    expect(screen.getByLabelText(/Acerca de/)).toBeDisabled();
    expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
  });
});
