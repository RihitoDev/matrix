import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CERTIFICATION_DOCUMENT_MESSAGES } from "../config/certification-document.config";
import { CERTIFICATION_VALIDATION_MESSAGES } from "../config/certification-validation.config";
import type { CertificationFormProps } from "../types/certification-form-props.types";
import type { CreateCertificationDto } from "../types/create-certification-dto.types";
import { CertificationForm } from "./certification-form";

const SAVED_VALUES: CreateCertificationDto = {
  name: "AWS Certified Cloud Practitioner",
  issuingOrganization: "Amazon Web Services",
  issueDate: "2025-03-10",
};

function renderForm(options: {
  initialData?: CreateCertificationDto;
  currentDocumentName?: string;
  onSubmit?: CertificationFormProps["onSubmit"];
} = {}) {
  const {
    initialData,
    currentDocumentName = "currentDocumentName" in options
      ? options.currentDocumentName
      : (options.initialData ? "titulo.pdf" : undefined),
    onSubmit = vi.fn().mockResolvedValue(null),
  } = options;
  const onCancel = vi.fn();
  render(
    <CertificationForm
      initialData={initialData}
      currentDocumentName={currentDocumentName}
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
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveAttribute("type", "button");
  });

  it("limits the name and organization to 150 characters and the date to 1950-01-01 or later", () => {
    renderForm();

    expect(getNameInput()).toHaveAttribute("maxLength", "150");
    expect(getOrganizationInput()).toHaveAttribute("maxLength", "150");
    expect(getIssueDateInput()).toHaveAttribute("min", "1950-01-01");
  });

  it("shows an inline error for a date written by hand before 1950", async () => {
    const { onSubmit, user } = renderForm({
      initialData: { ...SAVED_VALUES, issueDate: "1949-12-31" },
    });

    await user.click(saveButton());

    expect(screen.getByText(CERTIFICATION_VALIDATION_MESSAGES.minDate)).toBeInTheDocument();
    expect(getIssueDateInput()).toHaveAttribute("aria-invalid", "true");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("accepts the boundary date 1950-01-01", async () => {
    const { onSubmit, user } = renderForm({
      initialData: { ...SAVED_VALUES, issueDate: "1950-01-01" },
    });

    await user.click(saveButton());

    expect(onSubmit).toHaveBeenCalledTimes(1);
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
        issuingOrganization: "b".repeat(151),
      },
    });

    await user.click(saveButton());

    expect(
      screen.getAllByText(CERTIFICATION_VALIDATION_MESSAGES.nameTooLong),
    ).toHaveLength(2);
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

    expect(onSubmit).toHaveBeenCalledWith(
      { name, issuingOrganization, issueDate: "2025-04-20" },
      { type: "replace", file: expect.any(File) },
    );
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

    expect(onSubmit).toHaveBeenCalledWith(
      {
        name: "Scrum Master",
        issuingOrganization: "Scrum Alliance",
        issueDate: "2025-04-20",
      },
      { type: "replace", file: expect.any(File) },
    );
  });

  it("disables the inputs and buttons while the submit is in progress", async () => {
    let resolveSubmit: () => void = () => undefined;
    const onSubmit = vi.fn(
      () =>
        new Promise<null>((resolve) => {
          resolveSubmit = () => resolve(null);
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

  it("shows no spinner on cancel while the submit is in progress", async () => {
    const onSubmit = vi.fn(() => new Promise<null>(() => undefined));
    const { user } = renderForm({ initialData: SAVED_VALUES, onSubmit });

    await user.click(saveButton());

    const cancel = screen.getByRole("button", { name: "Cancelar" });
    expect(cancel).toBeDisabled();
    expect(cancel.querySelector("svg")).toBeNull();
  });

  it("discards the typed values, the selected file and the errors on cancel without calling the api", async () => {
    const { onCancel, onSubmit, user } = renderForm();

    await user.type(getNameInput(), "CCNA");
    await user.upload(
      screen.getByLabelText(/Archivo de respaldo/),
      new File(["certificate"], "certificate.pdf", { type: "application/pdf" }),
    );
    expect(await screen.findByText(/certificate\.pdf/)).toBeInTheDocument();
    await user.click(saveButton());
    expect(screen.getAllByText(CERTIFICATION_VALIDATION_MESSAGES.required).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(getNameInput()).toHaveValue("");
    expect(screen.queryByText(/certificate\.pdf/)).not.toBeInTheDocument();
    expect(screen.queryByText(CERTIFICATION_VALIDATION_MESSAGES.required)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Archivo de respaldo/)).toHaveValue("");
  });

  it("restores the initial data on cancel when editing", async () => {
    const { user } = renderForm({ initialData: SAVED_VALUES });

    await user.clear(getNameInput());
    await user.type(getNameInput(), "Changed name");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(getNameInput()).toHaveValue(SAVED_VALUES.name);
  });

  it("notifies when editing is cancelled", async () => {
    const { onCancel, onSubmit, user } = renderForm({ initialData: SAVED_VALUES });

    await user.clear(getNameInput());
    await user.type(getNameInput(), "Changed name");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  describe("document management when editing", () => {
    const PDF = new File(["certificate"], "nuevo.pdf", { type: "application/pdf" });

    it("shows the current document with replace and remove actions", () => {
      renderForm({ initialData: SAVED_VALUES, currentDocumentName: "titulo.pdf" });

      expect(screen.getByText("titulo.pdf")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Reemplazar" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Eliminar documento actual" })).toBeInTheDocument();
    });

    it("keeps the document when nothing is changed", async () => {
      const { onSubmit, user } = renderForm({ initialData: SAVED_VALUES, currentDocumentName: "titulo.pdf" });

      await user.click(saveButton());

      expect(onSubmit).toHaveBeenCalledWith(SAVED_VALUES, { type: "keep" });
    });

    it("requires a document when editing a certification without one", async () => {
      const { onSubmit, user } = renderForm({ initialData: SAVED_VALUES, currentDocumentName: undefined });

      await user.click(saveButton());

      expect(screen.getByText(CERTIFICATION_VALIDATION_MESSAGES.documentRequired)).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("shows an error when attempting to save after marking the document for removal without a new file", async () => {
      const { onSubmit, user } = renderForm({ initialData: SAVED_VALUES, currentDocumentName: "titulo.pdf" });

      await user.click(screen.getByRole("button", { name: "Eliminar documento actual" }));

      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText("El documento actual se eliminará al guardar.")).toBeInTheDocument();

      await user.click(saveButton());

      expect(screen.getByText(CERTIFICATION_VALIDATION_MESSAGES.documentRequired)).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("submits the new file as a replacement", async () => {
      const { onSubmit, user } = renderForm({ initialData: SAVED_VALUES, currentDocumentName: "titulo.pdf" });

      await user.upload(screen.getByLabelText(/Archivo de respaldo/), PDF);
      await user.click(saveButton());

      expect(onSubmit).toHaveBeenCalledWith(SAVED_VALUES, { type: "replace", file: PDF });
    });

    it("drops the removal mark when a new file is chosen", async () => {
      const { onSubmit, user } = renderForm({ initialData: SAVED_VALUES, currentDocumentName: "titulo.pdf" });

      await user.click(screen.getByRole("button", { name: "Eliminar documento actual" }));
      await user.upload(screen.getByLabelText(/Archivo de respaldo/), PDF);

      expect(screen.queryByText("El documento actual se eliminará al guardar.")).not.toBeInTheDocument();

      await user.click(saveButton());

      expect(onSubmit).toHaveBeenCalledWith(SAVED_VALUES, { type: "replace", file: PDF });
    });

    it("drops the selected file when the document is marked for removal and blocks saving without file", async () => {
      const { onSubmit, user } = renderForm({ initialData: SAVED_VALUES, currentDocumentName: "titulo.pdf" });

      await user.upload(screen.getByLabelText(/Archivo de respaldo/), PDF);
      await user.click(screen.getByRole("button", { name: "Eliminar documento actual" }));

      expect(screen.queryByText(/nuevo\.pdf/)).not.toBeInTheDocument();

      await user.click(saveButton());

      expect(screen.getByText(CERTIFICATION_VALIDATION_MESSAGES.documentRequired)).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("discards the new file and the removal mark on cancel", async () => {
      const { onSubmit, onCancel, user } = renderForm({
        initialData: SAVED_VALUES,
        currentDocumentName: "titulo.pdf",
      });

      await user.click(screen.getByRole("button", { name: "Eliminar documento actual" }));
      await user.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.queryByText("El documento actual se eliminará al guardar.")).not.toBeInTheDocument();
      expect(screen.getByText("titulo.pdf")).toBeInTheDocument();
    });

    it("shows the failure inline, keeps the data and lets the user retry", async () => {
      const onSubmit = vi
        .fn()
        .mockResolvedValueOnce("No se pudo adjuntar el documento. Inténtalo de nuevo.")
        .mockResolvedValueOnce(null);
      const { user } = renderForm({ initialData: SAVED_VALUES, currentDocumentName: "titulo.pdf", onSubmit });

      await user.upload(screen.getByLabelText(/Archivo de respaldo/), PDF);
      await user.click(saveButton());

      expect(await screen.findByText("No se pudo adjuntar el documento. Inténtalo de nuevo.")).toBeInTheDocument();
      expect(getNameInput()).toHaveValue(SAVED_VALUES.name);
      expect(screen.getByText(/nuevo\.pdf/)).toBeInTheDocument();

      await user.click(saveButton());

      expect(onSubmit).toHaveBeenCalledTimes(2);
      expect(onSubmit).toHaveBeenLastCalledWith(SAVED_VALUES, { type: "replace", file: PDF });
      expect(screen.queryByText("No se pudo adjuntar el documento. Inténtalo de nuevo.")).not.toBeInTheDocument();
    });
  });

  describe("file reading", () => {
    const PDF = new File(["certificate"], "nuevo.pdf", { type: "application/pdf" });

    function deferFileRead() {
      let finish: () => void = () => undefined;
      vi.spyOn(File.prototype, "arrayBuffer").mockImplementation(
        () =>
          new Promise<ArrayBuffer>((resolve) => {
            finish = () => resolve(new ArrayBuffer(0));
          }),
      );
      return { finish: () => finish() };
    }

    async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
      await user.type(getNameInput(), "CCNA");
      await user.type(getOrganizationInput(), "Cisco");
      fireEvent.change(getIssueDateInput(), { target: { value: "2024-01-15" } });
    }

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("shows a loading indicator and blocks saving until the file is ready", async () => {
      const read = deferFileRead();
      const { onSubmit, user } = renderForm();
      await fillRequiredFields(user);

      await user.upload(screen.getByLabelText(/Archivo de respaldo/), PDF);

      expect(screen.getByRole("status")).toHaveTextContent("Leyendo y validando el archivo...");
      expect(saveButton()).toBeDisabled();

      await user.click(saveButton());
      expect(onSubmit).not.toHaveBeenCalled();

      await act(async () => {
        read.finish();
      });

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.getByText(/nuevo\.pdf/)).toBeInTheDocument();
      expect(saveButton()).toBeEnabled();
    });

    it("shows the read error when the file cannot be read", async () => {
      vi.spyOn(File.prototype, "arrayBuffer").mockRejectedValue(new Error("unreadable"));
      const { user } = renderForm();

      await user.upload(screen.getByLabelText(/Archivo de respaldo/), PDF);

      expect(await screen.findByText(CERTIFICATION_DOCUMENT_MESSAGES.readError)).toBeInTheDocument();
      expect(saveButton()).toBeEnabled();
    });

    it("ignores a file that finishes reading after the form was cancelled", async () => {
      const read = deferFileRead();
      const { user } = renderForm();

      await user.upload(screen.getByLabelText(/Archivo de respaldo/), PDF);
      await user.click(screen.getByRole("button", { name: "Cancelar" }));
      await act(async () => {
        read.finish();
      });

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.queryByText(/nuevo\.pdf/)).not.toBeInTheDocument();
    });

    it("removes the selected file before submitting", async () => {
      const { user } = renderForm();

      await user.upload(screen.getByLabelText(/Archivo de respaldo/), PDF);
      await user.click(await screen.findByRole("button", { name: "Quitar archivo seleccionado" }));

      expect(screen.queryByText(/nuevo\.pdf/)).not.toBeInTheDocument();
      expect(screen.getByLabelText(/Archivo de respaldo/)).toHaveValue("");
    });
  });
});
