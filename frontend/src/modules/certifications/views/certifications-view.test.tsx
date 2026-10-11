import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CERTIFICATION_DOCUMENT_MESSAGES } from "../config/certification-document.config";
import { CERTIFICATION_FEEDBACK_MESSAGES } from "../config/certification-feedback.config";
import { FILE_VALIDATION_MESSAGES } from "@/modules/profile/config/file-validation-messages.config";
import { certificationsService } from "../services/certifications.service";
import type { Certification } from "../types/certification.types";
import { CertificationsView } from "./certifications-view";

vi.mock("../services/certifications.service", () => ({
  certificationsService: {
    getCertifications: vi.fn(),
    createCertification: vi.fn(),
    updateCertification: vi.fn(),
    deleteCertification: vi.fn(),
    uploadDocument: vi.fn(),
    getDocument: vi.fn(),
    deleteDocument: vi.fn(),
  },
}));

function createCertification(id: string, name: string, issueDate: string): Certification {
  return {
    id,
    name,
    issuingOrganization: "Scrum Alliance",
    issueDate,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  };
}

const SCRUM = createCertification("scrum", "Scrum Master", "2022-05-10");
const AWS = createCertification("aws", "AWS Cloud Practitioner", "2025-02-20");

function createDeferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

async function renderView() {
  await act(async () => {
    render(<CertificationsView />);
  });
  return userEvent.setup();
}

function getCertificationNames() {
  return within(screen.getByRole("list", { name: "Certificaciones" }))
    .getAllByRole("heading")
    .map((heading) => heading.textContent);
}

const CERTIFICATE_PDF = new File(["certificate"], "certificate.pdf", { type: "application/pdf" });

async function fillCertificationForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Nombre de la certificación/), "CCNA");
  await user.type(screen.getByLabelText(/Entidad emisora/), "Cisco");
  fireEvent.change(screen.getByLabelText(/Fecha de obtención/), { target: { value: "2024-01-15" } });
  await user.upload(within(screen.getByRole("form", { name: /certificación/i })).getByLabelText(/Archivo de respaldo/), CERTIFICATE_PDF);
}

async function linkDocument(user: ReturnType<typeof userEvent.setup>, certificationName: string) {
  await user.click(screen.getByRole("combobox", { name: /Certificación asociada/ }));
  await user.click(await screen.findByRole("option", { name: certificationName }));
  await user.upload(within(screen.getByRole("form", { name: "Vincular documento" })).getByLabelText(/Archivo de respaldo/), CERTIFICATE_PDF);
  await user.click(screen.getByRole("button", { name: "Guardar documento" }));
}

describe("CertificationsView", () => {
  beforeEach(() => {
    vi.mocked(certificationsService.getCertifications).mockResolvedValue([SCRUM, AWS]);
    vi.mocked(certificationsService.deleteCertification).mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows a loading message while the certifications load", () => {
    vi.mocked(certificationsService.getCertifications).mockReturnValue(new Promise(() => undefined));
    render(<CertificationsView />);

    expect(screen.getByText("Cargando certificaciones...")).toBeInTheDocument();
  });

  it("always shows the certifications and the documents cards side by side", async () => {
    await renderView();

    expect(screen.getByText("Tus certificaciones")).toBeInTheDocument();
    expect(screen.getByText("Documentos de respaldo", { selector: "[data-slot=card-title]" })).toBeInTheDocument();
    expect(screen.getByText("CERTIFICACIONES REGISTRADAS")).toBeInTheDocument();
    expect(screen.getByText("DOCUMENTOS CARGADOS")).toBeInTheDocument();
    expect(screen.queryByRole("form", { name: "Agregar certificación" })).not.toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Vincular documento" })).toBeInTheDocument();
  });

  it("renders the certifications from the newest to the oldest", async () => {
    await renderView();

    expect(getCertificationNames()).toEqual(["AWS Cloud Practitioner", "Scrum Master"]);
  });

  it("shows the empty state while keeping both forms available - updated", async () => {
    vi.mocked(certificationsService.getCertifications).mockResolvedValue([]);
    await renderView();

    expect(screen.getByText("Aún no has agregado certificaciones.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+ Agregar certificación" })).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Certificaciones" })).not.toBeInTheDocument();
    expect(screen.queryByRole("form", { name: "Agregar certificación" })).not.toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Vincular documento" })).toBeInTheDocument();
  });

  it("does not show the empty state when certifications exist", async () => {
    await renderView();

    expect(screen.queryByText("Aún no has agregado certificaciones.")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "+ Agregar certificación" })).toHaveLength(1);
  });

  it("keeps the header sticky and the list in a scrollable container", async () => {
    await renderView();

    const region = screen.getByRole("region", { name: "Certificaciones registradas" });
    const header = screen.getByText("CERTIFICACIONES REGISTRADAS").parentElement;

    expect(region).toHaveClass("overflow-y-auto");
    expect(region).toHaveClass("max-h-[380px]");
    expect(header).toHaveClass("sticky", "top-0", "z-10");
    expect(region).toContainElement(header);
    expect(region).toContainElement(screen.getByRole("list", { name: "Certificaciones" }));
  });

  it("focuses an empty form when adding a certification from the header", async () => {
    const user = await renderView();

    await user.click(screen.getByRole("button", { name: "Editar Scrum Master" }));
    expect(screen.getByLabelText(/Nombre de la certificación/)).toHaveValue("Scrum Master");

    await user.click(screen.getByRole("button", { name: "+ Agregar certificación" }));

    const nameInput = screen.getByLabelText(/Nombre de la certificación/);
    expect(nameInput).toHaveValue("");
    expect(nameInput).toHaveFocus();
  });

  it("keeps typed values when adding from the header without editing", async () => {
    const user = await renderView();

    await user.click(screen.getByRole("button", { name: "+ Agregar certificación" }));
    await user.type(screen.getByLabelText(/Nombre de la certificación/), "CCNA");
    await user.click(screen.getByRole("button", { name: "+ Agregar certificación" }));

    expect(screen.getByLabelText(/Nombre de la certificación/)).toHaveValue("CCNA");
  });

  it("shows the load error instead of the empty state and keeps the form available", async () => {
    vi.mocked(certificationsService.getCertifications).mockRejectedValue(new Error("failed"));
    await renderView();

    expect(screen.getByRole("alert")).toHaveTextContent(CERTIFICATION_FEEDBACK_MESSAGES.loadError);
    expect(screen.queryByText("Aún no has agregado certificaciones.")).not.toBeInTheDocument();
    expect(screen.queryByRole("form", { name: "Agregar certificación" })).not.toBeInTheDocument();
  });

  it("adds a certification, resets the form and reloads the list", async () => {
    const created = createCertification("ccna", "CCNA", "2024-01-15");
    vi.mocked(certificationsService.createCertification).mockResolvedValue(created);
    const user = await renderView();

    vi.mocked(certificationsService.getCertifications).mockResolvedValue([SCRUM, AWS, created]);
    await user.click(screen.getByRole("button", { name: "+ Agregar certificación" }));
    await fillCertificationForm(user);
    await user.click(screen.getByRole("button", { name: "Guardar certificación" }));

    expect(certificationsService.createCertification).toHaveBeenCalledWith({
      name: "CCNA",
      issuingOrganization: "Cisco",
      issueDate: "2024-01-15",
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      CERTIFICATION_FEEDBACK_MESSAGES.createSuccess,
    );
    expect(screen.queryByLabelText(/Nombre de la certificación/)).not.toBeInTheDocument();
    expect(getCertificationNames()).toEqual(["AWS Cloud Practitioner", "CCNA", "Scrum Master"]);
  });

  it("keeps the typed values when adding fails", async () => {
    vi.mocked(certificationsService.createCertification).mockRejectedValue(new Error("failed"));
    const user = await renderView();
    await user.click(screen.getByRole("button", { name: "+ Agregar certificación" }));
    await fillCertificationForm(user);
    await user.click(screen.getByRole("button", { name: "Guardar certificación" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      CERTIFICATION_FEEDBACK_MESSAGES.createError,
    );
    expect(screen.getByLabelText(/Nombre de la certificación/)).toHaveValue("CCNA");
  });

  it("edits a certification with its current values", async () => {
    vi.mocked(certificationsService.updateCertification).mockResolvedValue({
      ...SCRUM,
      name: "Professional Scrum Master",
    });
    const user = await renderView();

    await user.click(screen.getByRole("button", { name: "Editar Scrum Master" }));

    expect(screen.getByRole("form", { name: "Editar certificación" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre de la certificación/)).toHaveValue("Scrum Master");
    expect(screen.getByLabelText(/Fecha de obtención/)).toHaveValue("2022-05-10");

    await user.clear(screen.getByLabelText(/Nombre de la certificación/));
    await user.type(screen.getByLabelText(/Nombre de la certificación/), "Professional Scrum Master");
    await user.click(screen.getByRole("button", { name: "Guardar certificación" }));

    expect(certificationsService.updateCertification).toHaveBeenCalledWith("scrum", {
      name: "Professional Scrum Master",
      issuingOrganization: "Scrum Alliance",
      issueDate: "2022-05-10",
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      CERTIFICATION_FEEDBACK_MESSAGES.updateSuccess,
    );
    expect(screen.queryByRole("form", { name: "Agregar certificación" })).not.toBeInTheDocument();
  });

  it("closes the form when editing is cancelled", async () => {
    const user = await renderView();

    await user.click(screen.getByRole("button", { name: "Editar Scrum Master" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("form", { name: "Agregar certificación" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Nombre de la certificación/)).not.toBeInTheDocument();
  });

  it("keeps the edit form open when saving fails", async () => {
    vi.mocked(certificationsService.updateCertification).mockRejectedValue(new Error("failed"));
    const user = await renderView();

    await user.click(screen.getByRole("button", { name: "Editar Scrum Master" }));
    await user.click(screen.getByRole("button", { name: "Guardar certificación" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      CERTIFICATION_FEEDBACK_MESSAGES.updateError,
    );
    expect(screen.getByRole("form", { name: "Editar certificación" })).toBeInTheDocument();
  });

  it("opens the delete dialog with the certification name and cancels without deleting", async () => {
    const user = await renderView();

    await user.click(screen.getByRole("button", { name: "Eliminar Scrum Master" }));

    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText("Eliminar certificación")).toBeInTheDocument();
    expect(within(dialog).getByText(/"Scrum Master"/)).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(certificationsService.deleteCertification).not.toHaveBeenCalled();
    expect(getCertificationNames()).toEqual(["AWS Cloud Practitioner", "Scrum Master"]);
  });

  it("deletes the certification after confirming and reloads the list", async () => {
    const deletion = createDeferred<void>();
    vi.mocked(certificationsService.deleteCertification).mockReturnValue(deletion.promise);
    const user = await renderView();

    await user.click(screen.getByRole("button", { name: "Eliminar Scrum Master" }));
    const dialog = await screen.findByRole("alertdialog");
    vi.mocked(certificationsService.getCertifications).mockResolvedValue([AWS]);
    await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));

    expect(within(dialog).getByRole("button", { name: "Eliminando..." })).toBeDisabled();

    await act(async () => {
      deletion.resolve();
      await deletion.promise;
    });

    expect(certificationsService.deleteCertification).toHaveBeenCalledWith("scrum");
    expect(await screen.findByRole("status")).toHaveTextContent(
      CERTIFICATION_FEEDBACK_MESSAGES.deleteSuccess,
    );
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(getCertificationNames()).toEqual(["AWS Cloud Practitioner"]);
  });

  it("closes the edit form when the certification being edited is deleted", async () => {
    const user = await renderView();

    await user.click(screen.getByRole("button", { name: "Editar Scrum Master" }));
    await user.click(screen.getByRole("button", { name: "Eliminar Scrum Master" }));
    const dialog = await screen.findByRole("alertdialog");
    vi.mocked(certificationsService.getCertifications).mockResolvedValue([AWS]);
    await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(screen.queryByRole("form", { name: "Agregar certificación" })).not.toBeInTheDocument();
  });

  it("shows an error when the certification cannot be deleted", async () => {
    vi.mocked(certificationsService.deleteCertification).mockRejectedValue(new Error("failed"));
    const user = await renderView();

    await user.click(screen.getByRole("button", { name: "Eliminar Scrum Master" }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      CERTIFICATION_FEEDBACK_MESSAGES.deleteError,
    );
    expect(getCertificationNames()).toEqual(["AWS Cloud Practitioner", "Scrum Master"]);
  });

  describe("certification documents", () => {
    it("lists the certifications in the document select", async () => {
      const user = await renderView();

      await user.click(screen.getByRole("combobox", { name: /Certificación asociada/ }));

      expect(await screen.findByRole("option", { name: "Scrum Master" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "AWS Cloud Practitioner" })).toBeInTheDocument();
    });

    it("uploads a document for the chosen certification and reloads the list", async () => {
      vi.mocked(certificationsService.uploadDocument).mockResolvedValue(undefined);
      const user = await renderView();

      vi.mocked(certificationsService.getCertifications).mockResolvedValue([
        { ...SCRUM, hasDocument: true },
        AWS,
      ]);
      await linkDocument(user, "Scrum Master");

      expect(certificationsService.uploadDocument).toHaveBeenCalledWith("scrum", CERTIFICATE_PDF);
      expect(await screen.findByRole("status")).toHaveTextContent(
        CERTIFICATION_DOCUMENT_MESSAGES.uploadSuccess,
      );
      expect(
        await screen.findByRole("button", { name: "Ver documento de Scrum Master" }),
      ).toHaveTextContent("certificate.pdf");
    });

    it("reports when the document cannot be uploaded", async () => {
      vi.mocked(certificationsService.uploadDocument).mockRejectedValue(new Error("failed"));
      const user = await renderView();

      await linkDocument(user, "Scrum Master");

      expect(await screen.findByRole("alert")).toHaveTextContent(
        CERTIFICATION_DOCUMENT_MESSAGES.uploadError,
      );
    });

    it("removes a document after confirming and reloads the list", async () => {
      const withDocument = { ...SCRUM, hasDocument: true };
      vi.mocked(certificationsService.getCertifications).mockResolvedValue([withDocument, AWS]);
      vi.mocked(certificationsService.deleteDocument).mockResolvedValue(undefined);
      const user = await renderView();

      vi.mocked(certificationsService.getCertifications).mockResolvedValue([SCRUM, AWS]);
      await user.click(screen.getByRole("button", { name: "Eliminar documento de Scrum Master" }));
      const dialog = await screen.findByRole("alertdialog");
      await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));

      expect(certificationsService.deleteDocument).toHaveBeenCalledWith("scrum");
      expect(await screen.findByRole("status")).toHaveTextContent(
        CERTIFICATION_DOCUMENT_MESSAGES.removeSuccess,
      );
      await waitFor(() =>
        expect(
          screen.queryByRole("button", { name: "Ver documento de Scrum Master" }),
        ).not.toBeInTheDocument(),
      );
    });

    it("reports when the document cannot be removed", async () => {
      vi.mocked(certificationsService.getCertifications).mockResolvedValue([
        { ...SCRUM, hasDocument: true },
      ]);
      vi.mocked(certificationsService.deleteDocument).mockRejectedValue(new Error("failed"));
      const user = await renderView();

      await user.click(screen.getByRole("button", { name: "Eliminar documento de Scrum Master" }));
      const dialog = await screen.findByRole("alertdialog");
      await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));

      expect(await screen.findByRole("alert")).toHaveTextContent(
        CERTIFICATION_DOCUMENT_MESSAGES.removeError,
      );
    });

    it("replaces a document with a new file", async () => {
      vi.mocked(certificationsService.getCertifications).mockResolvedValue([
        { ...SCRUM, hasDocument: true },
      ]);
      vi.mocked(certificationsService.uploadDocument).mockResolvedValue(undefined);
      const user = await renderView();

      await user.click(screen.getByRole("button", { name: "Reemplazar documento de Scrum Master" }));
      await user.upload(screen.getByLabelText("Archivo de reemplazo"), CERTIFICATE_PDF);

      expect(certificationsService.uploadDocument).toHaveBeenCalledWith("scrum", CERTIFICATE_PDF);
    });

    it("reports an invalid replacement file in the feedback area", async () => {
      vi.mocked(certificationsService.getCertifications).mockResolvedValue([
        { ...SCRUM, hasDocument: true },
      ]);
      const user = await renderView();

      await user.click(screen.getByRole("button", { name: "Reemplazar documento de Scrum Master" }));
      fireEvent.change(screen.getByLabelText("Archivo de reemplazo"), {
        target: { files: [new File(["text"], "notes.txt", { type: "text/plain" })] },
      });

      expect(await screen.findByRole("alert")).toHaveTextContent(
        FILE_VALIDATION_MESSAGES.invalidCertificateType,
      );
      expect(certificationsService.uploadDocument).not.toHaveBeenCalled();
    });

    it("opens the attached document", async () => {
      vi.mocked(certificationsService.getCertifications).mockResolvedValue([
        { ...SCRUM, hasDocument: true },
        AWS,
      ]);
      vi.mocked(certificationsService.getDocument).mockResolvedValue(CERTIFICATE_PDF);
      const documentTab = { close: vi.fn(), location: { href: "" } } as unknown as Window;
      const openSpy = vi.spyOn(window, "open").mockReturnValue(documentTab);
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:certificate");
      const user = await renderView();

      await user.click(screen.getByRole("button", { name: "Ver documento de Scrum Master" }));

      await waitFor(() => expect(documentTab.location.href).toBe("blob:certificate"));
      expect(certificationsService.getDocument).toHaveBeenCalledWith("scrum");
      openSpy.mockRestore();
    });

    it("reports when the attached document cannot be opened", async () => {
      vi.mocked(certificationsService.getCertifications).mockResolvedValue([
        { ...SCRUM, hasDocument: true },
      ]);
      vi.mocked(certificationsService.getDocument).mockRejectedValue(new Error("failed"));
      const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
      const user = await renderView();

      await user.click(screen.getByRole("button", { name: "Ver documento de Scrum Master" }));

      expect(await screen.findByRole("alert")).toHaveTextContent(
        CERTIFICATION_DOCUMENT_MESSAGES.openError,
      );
      openSpy.mockRestore();
    });
  });
});
