import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FILE_VALIDATION_MESSAGES } from "@/modules/profile/config/file-validation-messages.config";
import { CERTIFICATION_DOCUMENT_VALIDATION_MESSAGES } from "../constants/certification-form.constants";
import type { Certification } from "../types/certification.types";
import { CertificationDocumentForm } from "./certification-document-form";

function createCertification(id: string, name: string): Certification {
  return {
    id,
    name,
    issuingOrganization: "Scrum Alliance",
    issueDate: "2025-01-01",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  };
}

const CERTIFICATIONS = [
  createCertification("scrum", "Scrum Master"),
  createCertification("aws", "AWS Cloud Practitioner"),
];
const CERTIFICATE_PDF = new File(["certificate"], "certificate.pdf", { type: "application/pdf" });

function renderForm({
  certifications = CERTIFICATIONS,
  isPending = false,
  onSubmit = vi.fn().mockResolvedValue(true),
}: {
  certifications?: Certification[];
  isPending?: boolean;
  onSubmit?: (certificationId: string, file: File) => boolean | Promise<boolean>;
} = {}) {
  render(
    <CertificationDocumentForm
      certifications={certifications}
      isPending={isPending}
      onSubmit={onSubmit}
    />,
  );
  return { onSubmit, user: userEvent.setup() };
}

function getFileInput(): HTMLInputElement {
  return screen.getByLabelText(/Archivo de respaldo/);
}

async function chooseCertification(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole("combobox", { name: /Certificación asociada/ }));
  await user.click(await screen.findByRole("option", { name }));
}

describe("CertificationDocumentForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the select, the file box and the footer", () => {
    renderForm();

    expect(screen.getByRole("form", { name: "Vincular documento" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /Certificación asociada/ })).toBeEnabled();
    expect(screen.getByText("El archivo se vinculará a la certificación elegida.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar documento" })).toBeEnabled();
  });

  it("lists the certifications as options", async () => {
    const { user } = renderForm();

    await user.click(screen.getByRole("combobox", { name: /Certificación asociada/ }));

    expect(await screen.findByRole("option", { name: "Scrum Master" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "AWS Cloud Practitioner" })).toBeInTheDocument();
  });

  it("disables the select when there are no certifications", () => {
    renderForm({ certifications: [] });

    expect(screen.getByRole("combobox", { name: /Certificación asociada/ })).toBeDisabled();
  });

  it("requires a certification and a file", async () => {
    const { onSubmit, user } = renderForm();

    await user.click(screen.getByRole("button", { name: "Guardar documento" }));

    expect(
      screen.getByText(CERTIFICATION_DOCUMENT_VALIDATION_MESSAGES.certificationRequired),
    ).toBeInTheDocument();
    expect(screen.getByText(CERTIFICATION_DOCUMENT_VALIDATION_MESSAGES.fileRequired)).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /Certificación asociada/ })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("clears the certification error after choosing one", async () => {
    const { user } = renderForm();

    await user.click(screen.getByRole("button", { name: "Guardar documento" }));
    await chooseCertification(user, "Scrum Master");

    expect(
      screen.queryByText(CERTIFICATION_DOCUMENT_VALIDATION_MESSAGES.certificationRequired),
    ).not.toBeInTheDocument();
  });

  it("shows an inline error for a file with an invalid type", () => {
    renderForm();

    fireEvent.change(getFileInput(), {
      target: { files: [new File(["text"], "notes.txt", { type: "text/plain" })] },
    });

    expect(screen.getByText(FILE_VALIDATION_MESSAGES.invalidCertificateType)).toBeInTheDocument();
    expect(getFileInput()).toHaveAttribute("aria-invalid", "true");
  });

  it("does not submit while the file error is present", async () => {
    const { onSubmit, user } = renderForm();

    await chooseCertification(user, "Scrum Master");
    fireEvent.change(getFileInput(), {
      target: { files: [new File(["text"], "notes.txt", { type: "text/plain" })] },
    });
    await user.click(screen.getByRole("button", { name: "Guardar documento" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows an inline error for a file that is too large", () => {
    renderForm();
    const largeFile = new File(["x"], "large.pdf", { type: "application/pdf" });
    Object.defineProperty(largeFile, "size", { value: 6 * 1024 * 1024 });

    fireEvent.change(getFileInput(), { target: { files: [largeFile] } });

    expect(screen.getByText(FILE_VALIDATION_MESSAGES.fileTooLarge)).toBeInTheDocument();
  });

  it("submits the chosen certification and file, then resets the form", async () => {
    const { onSubmit, user } = renderForm();

    await chooseCertification(user, "Scrum Master");
    await user.upload(getFileInput(), CERTIFICATE_PDF);

    expect(screen.getByText(/certificate\.pdf/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Guardar documento" }));

    expect(onSubmit).toHaveBeenCalledWith("scrum", CERTIFICATE_PDF);
    expect(await screen.findByText("PDF, JPG o PNG - Selecciona el documento o imagen.")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /Certificación asociada/ })).toHaveTextContent(
      "Selecciona una certificación",
    );
  });

  it("keeps the selection when the document cannot be saved", async () => {
    const { user } = renderForm({ onSubmit: vi.fn().mockResolvedValue(false) });

    await chooseCertification(user, "Scrum Master");
    await user.upload(getFileInput(), CERTIFICATE_PDF);
    await user.click(screen.getByRole("button", { name: "Guardar documento" }));

    expect(await screen.findByRole("button", { name: "Guardar documento" })).toBeEnabled();
    expect(screen.getByText(/certificate\.pdf/)).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /Certificación asociada/ })).toHaveTextContent(
      "Scrum Master",
    );
  });

  it("removes the pending file and requires a new one before saving", async () => {
    const { onSubmit, user } = renderForm();

    await chooseCertification(user, "Scrum Master");
    await user.upload(getFileInput(), CERTIFICATE_PDF);
    await user.click(screen.getByRole("button", { name: "Quitar archivo seleccionado" }));

    expect(screen.queryByText(/certificate\.pdf/)).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /Certificación asociada/ })).toHaveTextContent(
      "Scrum Master",
    );

    await user.click(screen.getByRole("button", { name: "Guardar documento" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText(CERTIFICATION_DOCUMENT_VALIDATION_MESSAGES.fileRequired),
    ).toBeInTheDocument();
  });

  it("shows the upload status while the document is being saved", async () => {
    let resolveSave: (value: boolean) => void = () => undefined;
    const onSubmit = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolveSave = resolve;
        }),
    );
    const { user } = renderForm({ onSubmit });

    await chooseCertification(user, "Scrum Master");
    await user.upload(getFileInput(), CERTIFICATE_PDF);
    await user.click(screen.getByRole("button", { name: "Guardar documento" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Subiendo documento...");
    expect(screen.getByRole("button", { name: "Quitar archivo seleccionado" })).toBeDisabled();

    resolveSave(false);
    expect(await screen.findByRole("button", { name: "Guardar documento" })).toBeEnabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByText(/certificate\.pdf/)).toBeInTheDocument();
  });

  it("disables the form while a save is pending", () => {
    renderForm({ isPending: true });

    expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Seleccionar archivo" })).toBeDisabled();
  });
});
