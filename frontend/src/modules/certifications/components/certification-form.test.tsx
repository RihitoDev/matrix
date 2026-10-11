import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CERTIFICATION_VALIDATION_MESSAGES } from "../config/certification-validation.config";
import type { CertificationFormProps } from "../types/certification-form-props.types";
import type { CreateCertificationDto } from "../types/create-certification-dto.types";
import { CertificationForm } from "./certification-form";

const SAVED_VALUES: CreateCertificationDto = {
  name: "AWS Certified Cloud Practitioner",
  issuingOrganization: "Amazon Web Services",
  issueDate: "2025-03-10",
};

function renderForm({
  initialData,
  isPending = false,
  onSubmit = vi.fn(),
}: {
  initialData?: CreateCertificationDto;
  isPending?: boolean;
  onSubmit?: CertificationFormProps["onSubmit"];
} = {}) {
  const onCancel = vi.fn();
  render(
    <CertificationForm
      initialData={initialData}
      isPending={isPending}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />,
  );
  return { onSubmit, onCancel, user: userEvent.setup() };
}

function getNameInput() {
  return screen.getByLabelText(/Nombre de la certificación/);
}

function getOrganizationInput() {
  return screen.getByLabelText(/Entidad emisora/);
}

function getIssueDateInput() {
  return screen.getByLabelText(/Fecha de obtención/);
}

function saveButton() {
  return screen.getByRole("button", { name: "Guardar certificación" });
}

describe("CertificationForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders empty inputs to add a certification", () => {
    renderForm();

    expect(screen.getByRole("form", { name: "Agregar certificación" })).toBeInTheDocument();
    expect(getNameInput()).toHaveValue("");
    expect(getOrganizationInput()).toHaveValue("");
    expect(getIssueDateInput()).toHaveAttribute("type", "date");
    expect(screen.getByText("* Campos obligatorios")).toBeInTheDocument();
    expect(saveButton()).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Cancelar" })).not.toBeInTheDocument();
  });

  it("fills the inputs with the initial data and shows cancel when editing", () => {
    renderForm({ initialData: SAVED_VALUES });

    expect(screen.getByRole("form", { name: "Editar certificación" })).toBeInTheDocument();
    expect(getNameInput()).toHaveValue(SAVED_VALUES.name);
    expect(getOrganizationInput()).toHaveValue(SAVED_VALUES.issuingOrganization);
    expect(getIssueDateInput()).toHaveValue("2025-03-10");
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("shows inline errors and does not submit invalid values", async () => {
    const { onSubmit, user } = renderForm();

    await user.click(saveButton());

    expect(screen.getAllByText(CERTIFICATION_VALIDATION_MESSAGES.required)).toHaveLength(3);
    expect(getNameInput()).toHaveAttribute("aria-invalid", "true");
    expect(getNameInput()).toHaveAttribute("aria-describedby", "certification-name-error");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows the error only next to the field that is empty", async () => {
    const { onSubmit, user } = renderForm({
      initialData: { ...SAVED_VALUES, issueDate: "" },
    });

    await user.click(saveButton());

    expect(screen.getAllByText(CERTIFICATION_VALIDATION_MESSAGES.required)).toHaveLength(1);
    expect(getIssueDateInput()).toHaveAttribute("aria-invalid", "true");
    expect(getNameInput()).toHaveAttribute("aria-invalid", "false");
    expect(getOrganizationInput()).toHaveAttribute("aria-invalid", "false");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects a name made only of spaces", async () => {
    const { onSubmit, user } = renderForm({ initialData: SAVED_VALUES });

    await user.clear(getNameInput());
    await user.type(getNameInput(), "    ");
    await user.click(saveButton());

    expect(screen.getByText(CERTIFICATION_VALIDATION_MESSAGES.required)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("applies the length limits when editing", async () => {
    const { onSubmit, user } = renderForm({
      initialData: {
        ...SAVED_VALUES,
        name: "a".repeat(151),
        issuingOrganization: "b".repeat(101),
      },
    });

    await user.click(saveButton());

    expect(screen.getByText(CERTIFICATION_VALIDATION_MESSAGES.nameTooLong)).toBeInTheDocument();
    expect(
      screen.getByText(CERTIFICATION_VALIDATION_MESSAGES.organizationTooLong),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows an inline error for html or script tags", async () => {
    const { onSubmit, user } = renderForm();
    const name = "<script>alert(1)</script>";
    const issuingOrganization = "<b>Media</b>";

    fireEvent.change(getNameInput(), { target: { value: name } });
    fireEvent.change(getOrganizationInput(), { target: { value: issuingOrganization } });
    fireEvent.change(getIssueDateInput(), { target: { value: "2025-04-20" } });
    await user.click(saveButton());

    expect(screen.getAllByText("No se permiten etiquetas HTML ni scripts")).toHaveLength(2);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits special characters without altering them", async () => {
    const { onSubmit, user } = renderForm();
    const name = "O'Reilly \"Media\"";
    const issuingOrganization = "'; DROP TABLE certifications;--";

    fireEvent.change(getNameInput(), { target: { value: name } });
    fireEvent.change(getOrganizationInput(), { target: { value: issuingOrganization } });
    fireEvent.change(getIssueDateInput(), { target: { value: "2025-04-20" } });
    const fileInputs = screen.getAllByLabelText(/Archivo de respaldo/);
    await user.upload(fileInputs[0], new File(["certificate"], "certificate.pdf", { type: "application/pdf" }));
    await user.click(saveButton());

    expect(onSubmit).toHaveBeenCalledWith({ name, issuingOrganization, issueDate: "2025-04-20" }, expect.any(File));
  });

  it("shows an inline error for a future issue date", async () => {
    const { onSubmit, user } = renderForm({
      initialData: { ...SAVED_VALUES, issueDate: "2999-01-01" },
    });

    await user.click(saveButton());

    expect(screen.getByText(CERTIFICATION_VALIDATION_MESSAGES.futureDate)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("clears the error of a field when it changes", async () => {
    const { user } = renderForm();

    await user.click(saveButton());
    await user.type(getNameInput(), "Scrum Master");

    expect(getNameInput()).toHaveAttribute("aria-invalid", "false");
    expect(screen.getAllByText(CERTIFICATION_VALIDATION_MESSAGES.required)).toHaveLength(2);
  });

  it("submits the trimmed values with the chosen day", async () => {
    const { onSubmit, user } = renderForm();

    await user.type(getNameInput(), "  Scrum Master  ");
    await user.type(getOrganizationInput(), " Scrum Alliance ");
    fireEvent.change(getIssueDateInput(), { target: { value: "2025-04-20" } });
    const fileInputs = screen.getAllByLabelText(/Archivo de respaldo/);
    await user.upload(fileInputs[0], new File(["certificate"], "certificate.pdf", { type: "application/pdf" }));
    await user.click(saveButton());

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Scrum Master",
      issuingOrganization: "Scrum Alliance",
      issueDate: "2025-04-20",
    }, expect.any(File));
  });

  it("disables the inputs and buttons while the submit is in progress", async () => {
    let resolveSubmit: () => void = () => undefined;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    const { user } = renderForm({ initialData: SAVED_VALUES, onSubmit });

    await user.click(saveButton());

    expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(getNameInput()).toBeDisabled();

    resolveSubmit();

    expect(await screen.findByRole("button", { name: "Guardar certificación" })).toBeEnabled();
  });

  it("disables the submit button while the mutation is pending", () => {
    renderForm({ initialData: SAVED_VALUES, isPending: true });

    expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });

  it("notifies when editing is cancelled", async () => {
    const { onCancel, onSubmit, user } = renderForm({ initialData: SAVED_VALUES });

    await user.clear(getNameInput());
    await user.type(getNameInput(), "Changed name");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
