import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CERTIFICATION_DOCUMENT_MESSAGES } from "../config/certification-document.config";
import { CERTIFICATION_FEEDBACK_MESSAGES } from "../config/certification-feedback.config";
import { CERTIFICATION_VALIDATION_MESSAGES } from "../config/certification-validation.config";
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

const SCRUM = { ...createCertification("scrum", "Scrum Master", "2022-05-10"), hasDocument: true };
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

describe("CertificationsView", () => {
  beforeEach(() => {
    sessionStorage.clear();
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
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows exactly one document indicator per certification card", async () => {
    vi.mocked(certificationsService.getCertifications).mockResolvedValue([
      SCRUM,
      AWS,
    ]);
    await renderView();

    const list = screen.getByRole("list", { name: "Certificaciones" });
    const cards = within(list).getAllByRole("article");

    expect(cards).toHaveLength(2);
    expect(within(cards[0]).getByText("Sin documento de respaldo")).toBeInTheDocument();
    expect(within(cards[0]).queryByRole("button", { name: /Previsualizar documento/ })).not.toBeInTheDocument();
    expect(within(cards[1]).getByRole("button", { name: "Previsualizar documento de Scrum Master" })).toBeInTheDocument();
    expect(within(cards[1]).queryByText("Sin documento de respaldo")).not.toBeInTheDocument();
  });

  it("renders the certifications from the newest to the oldest", async () => {
    await renderView();

    expect(getCertificationNames()).toEqual(["AWS Cloud Practitioner", "Scrum Master"]);
  });

  it("shows the empty state without any form at rest", async () => {
    vi.mocked(certificationsService.getCertifications).mockResolvedValue([]);
    await renderView();

    expect(screen.getByText("Aún no has agregado certificaciones.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+ Agregar certificación" })).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Certificaciones" })).not.toBeInTheDocument();
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
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

  it("opens the unified form at the top of the documents panel", async () => {
    vi.mocked(certificationsService.getCertifications).mockResolvedValue([{ ...SCRUM, hasDocument: true }, AWS]);
    const user = await renderView();

    await user.click(screen.getByRole("button", { name: "+ Agregar certificación" }));

    const form = screen.getByRole("form", { name: "Agregar certificación" });
    const panel = screen.getByText("Documentos de respaldo", { selector: "[data-slot=card-title]" }).closest("[data-slot=card]");
    const documentsList = within(panel as HTMLElement).getByRole("list");

    expect(panel).toContainElement(form);
    expect(form.compareDocumentPosition(documentsList) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("resets the form when adding again while it is already open", async () => {
    const user = await renderView();

    await user.click(screen.getByRole("button", { name: "+ Agregar certificación" }));
    await user.type(screen.getByLabelText(/Nombre de la certificación/), "CCNA");
    await user.click(screen.getByRole("button", { name: "+ Agregar certificación" }));

    expect(screen.getByLabelText(/Nombre de la certificación/)).toHaveValue("");
  });

  it("resets the form with the data of another certification when editing a different card", async () => {
    const user = await renderView();

    await user.click(screen.getByRole("button", { name: "Editar Scrum Master" }));
    await user.type(screen.getByLabelText(/Nombre de la certificación/), " extra");
    await user.click(screen.getByRole("button", { name: "Editar AWS Cloud Practitioner" }));

    expect(screen.getByLabelText(/Nombre de la certificación/)).toHaveValue("AWS Cloud Practitioner");
  });

  it("resets the form when editing the same card again", async () => {
    const user = await renderView();

    await user.click(screen.getByRole("button", { name: "Editar Scrum Master" }));
    await user.type(screen.getByLabelText(/Nombre de la certificación/), " extra");
    await user.click(screen.getByRole("button", { name: "Editar Scrum Master" }));

    expect(screen.getByLabelText(/Nombre de la certificación/)).toHaveValue("Scrum Master");
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

  describe("submitting state isolation", () => {
    it("shows the spinner only on the save button and leaves the rest of the view enabled", async () => {
      const saving = createDeferred<Certification>();
      vi.mocked(certificationsService.getCertifications).mockResolvedValue([
        { ...SCRUM, hasDocument: true },
        AWS,
      ]);
      vi.mocked(certificationsService.updateCertification).mockReturnValue(saving.promise);
      const user = await renderView();

      await user.click(screen.getByRole("button", { name: "Editar Scrum Master" }));
      await user.click(screen.getByRole("button", { name: "Guardar certificación" }));

      const form = screen.getByRole("form", { name: "Editar certificación" });
      expect(within(form).getByRole("button", { name: "Guardando..." })).toBeDisabled();
      expect(within(form).getByRole("button", { name: "Cancelar" })).toBeDisabled();
      expect(document.querySelectorAll(".animate-spin")).toHaveLength(1);
      expect(form.querySelectorAll(".animate-spin")).toHaveLength(1);

      expect(screen.getAllByRole("button", { name: "+ Agregar certificación" })[0]).toBeEnabled();
      expect(screen.getByRole("button", { name: "Editar Scrum Master" })).toBeEnabled();
      expect(screen.getByRole("button", { name: "Editar AWS Cloud Practitioner" })).toBeEnabled();
      expect(screen.getByRole("button", { name: "Eliminar Scrum Master" })).toBeEnabled();
      expect(screen.getByRole("button", { name: "Previsualizar documento de Scrum Master" })).toBeEnabled();
      expect(screen.getByRole("button", { name: "Ver documento de Scrum Master" })).toBeEnabled();

      await act(async () => {
        saving.resolve({ ...SCRUM, hasDocument: true });
        await saving.promise;
      });
    });

    it("keeps the rest of the view enabled while the document of a new certification is uploading", async () => {
      const uploading = createDeferred<void>();
      vi.mocked(certificationsService.createCertification).mockResolvedValue(
        createCertification("ccna", "CCNA", "2024-01-15"),
      );
      vi.mocked(certificationsService.uploadDocument).mockReturnValue(uploading.promise);
      const user = await renderView();

      await user.click(screen.getByRole("button", { name: "+ Agregar certificación" }));
      await fillCertificationForm(user);
      await user.click(screen.getByRole("button", { name: "Guardar certificación" }));

      expect(await screen.findByRole("button", { name: "Guardando..." })).toBeDisabled();
      expect(document.querySelectorAll(".animate-spin")).toHaveLength(1);
      expect(screen.getByRole("button", { name: "+ Agregar certificación" })).toBeEnabled();
      expect(screen.getByRole("button", { name: "Editar Scrum Master" })).toBeEnabled();

      await act(async () => {
        uploading.resolve();
        await uploading.promise;
      });
    });

    it("does not close a different form opened while the previous one was saving", async () => {
      const saving = createDeferred<Certification>();
      vi.mocked(certificationsService.updateCertification).mockReturnValue(saving.promise);
      const user = await renderView();

      await user.click(screen.getByRole("button", { name: "Editar Scrum Master" }));
      await user.click(screen.getByRole("button", { name: "Guardar certificación" }));
      await user.click(screen.getByRole("button", { name: "Editar AWS Cloud Practitioner" }));

      await act(async () => {
        saving.resolve(SCRUM);
        await saving.promise;
      });

      expect(screen.getByRole("form", { name: "Editar certificación" })).toBeInTheDocument();
      expect(screen.getByLabelText(/Nombre de la certificación/)).toHaveValue("AWS Cloud Practitioner");
      expect(screen.getByRole("button", { name: "Guardar certificación" })).toBeEnabled();
    });
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
    it("shows the corrupted file message next to the selector, keeps the data and does not duplicate the certification on retry", async () => {
      const corrupted = {
        response: { status: 400, data: { data: { code: "CORRUPTED_FILE" } } },
      };
      let createdCount = 0;
      vi.mocked(certificationsService.createCertification).mockImplementation(async () => {
        createdCount += 1;
        return createCertification(`ccna-${createdCount}`, "CCNA", "2024-01-15");
      });
      vi.mocked(certificationsService.uploadDocument)
        .mockRejectedValueOnce(corrupted)
        .mockResolvedValueOnce(undefined);
      const user = await renderView();

      await user.click(screen.getByRole("button", { name: "+ Agregar certificación" }));
      await fillCertificationForm(user);
      await user.click(screen.getByRole("button", { name: "Guardar certificación" }));

      const form = screen.getByRole("form", { name: "Agregar certificación" });
      expect(
        await within(form).findByText("El archivo adjunto está dañado o no es válido"),
      ).toBeInTheDocument();
      expect(within(form).getByLabelText(/Nombre de la certificación/)).toHaveValue("CCNA");
      expect(within(form).getByLabelText(/Entidad emisora/)).toHaveValue("Cisco");
      expect(certificationsService.deleteCertification).toHaveBeenCalledWith("ccna-1");

      vi.mocked(certificationsService.getCertifications).mockResolvedValue([
        SCRUM,
        AWS,
        createCertification("ccna-2", "CCNA", "2024-01-15"),
      ]);
      await user.click(screen.getByRole("button", { name: "Guardar certificación" }));

      await waitFor(() => expect(screen.queryByRole("form")).not.toBeInTheDocument());
      expect(certificationsService.uploadDocument).toHaveBeenLastCalledWith("ccna-2", CERTIFICATE_PDF);
      expect(getCertificationNames().filter((name) => name === "CCNA")).toHaveLength(1);
    });

    it("is not possible to attach a document outside the unified form", async () => {
      vi.mocked(certificationsService.getCertifications).mockResolvedValue([
        { ...SCRUM, hasDocument: true },
        AWS,
      ]);
      await renderView();

      expect(screen.queryByRole("combobox", { name: /Certificación asociada/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Guardar documento" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Reemplazar documento/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Eliminar documento/ })).not.toBeInTheDocument();
    });

    it("uploads the document of a new certification and rolls back when the upload fails", async () => {
      vi.mocked(certificationsService.createCertification).mockResolvedValue(
        createCertification("ccna", "CCNA", "2024-01-15"),
      );
      vi.mocked(certificationsService.uploadDocument).mockRejectedValue(new Error("failed"));
      const user = await renderView();

      await user.click(screen.getByRole("button", { name: "+ Agregar certificación" }));
      await fillCertificationForm(user);
      await user.click(screen.getByRole("button", { name: "Guardar certificación" }));

      expect(await screen.findByText(CERTIFICATION_DOCUMENT_MESSAGES.uploadError)).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(certificationsService.uploadDocument).toHaveBeenCalledWith("ccna", CERTIFICATE_PDF);
      expect(certificationsService.deleteCertification).toHaveBeenCalledWith("ccna");
      expect(screen.getByRole("form", { name: "Agregar certificación" })).toBeInTheDocument();
    });

    describe("when editing a certification with a document", () => {
      const WITH_DOCUMENT = { ...SCRUM, hasDocument: true };

      beforeEach(() => {
        vi.mocked(certificationsService.getCertifications).mockResolvedValue([WITH_DOCUMENT, AWS]);
        vi.mocked(certificationsService.updateCertification).mockResolvedValue(WITH_DOCUMENT);
      });

      it("keeps the document untouched when only the fields change", async () => {
        const user = await renderView();

        await user.click(screen.getByRole("button", { name: "Editar Scrum Master" }));
        expect(screen.getByRole("button", { name: "Eliminar documento actual" })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Guardar certificación" }));

        await waitFor(() => expect(screen.queryByRole("form")).not.toBeInTheDocument());
        expect(certificationsService.updateCertification).toHaveBeenCalled();
        expect(certificationsService.uploadDocument).not.toHaveBeenCalled();
        expect(certificationsService.deleteDocument).not.toHaveBeenCalled();
      });

      it("replaces the document after updating the fields and refreshes the list", async () => {
        vi.mocked(certificationsService.uploadDocument).mockResolvedValue(undefined);
        const user = await renderView();

        await user.click(screen.getByRole("button", { name: "Editar Scrum Master" }));
        await user.upload(screen.getByLabelText(/Archivo de respaldo/), CERTIFICATE_PDF);
        vi.mocked(certificationsService.getCertifications).mockClear();
        await user.click(screen.getByRole("button", { name: "Guardar certificación" }));

        await waitFor(() => expect(screen.queryByRole("form")).not.toBeInTheDocument());
        expect(certificationsService.uploadDocument).toHaveBeenCalledWith("scrum", CERTIFICATE_PDF);
        expect(vi.mocked(certificationsService.updateCertification).mock.invocationCallOrder[0]).toBeLessThan(
          vi.mocked(certificationsService.uploadDocument).mock.invocationCallOrder[0],
        );
        expect(certificationsService.getCertifications).toHaveBeenCalled();
        expect(
          await screen.findByRole("button", { name: "Ver documento de Scrum Master" }),
        ).toHaveTextContent("certificate.pdf");
      });

      it("prevents saving without a document when the current one is removed and shows the required error", async () => {
        const user = await renderView();

        await user.click(screen.getByRole("button", { name: "Editar Scrum Master" }));
        await user.click(screen.getByRole("button", { name: "Eliminar documento actual" }));
        await user.click(screen.getByRole("button", { name: "Guardar certificación" }));

        expect(
          screen.getByText(CERTIFICATION_VALIDATION_MESSAGES.documentRequired),
        ).toBeInTheDocument();
        expect(certificationsService.deleteDocument).not.toHaveBeenCalled();
        expect(certificationsService.updateCertification).not.toHaveBeenCalled();
      });

      it("does not call the document api when cancelling after marking the removal", async () => {
        const user = await renderView();

        await user.click(screen.getByRole("button", { name: "Editar Scrum Master" }));
        await user.click(screen.getByRole("button", { name: "Eliminar documento actual" }));
        await user.click(screen.getByRole("button", { name: "Cancelar" }));

        expect(certificationsService.updateCertification).not.toHaveBeenCalled();
        expect(certificationsService.deleteDocument).not.toHaveBeenCalled();
      });

      it("keeps the form open with an inline error and the data when the document operation fails", async () => {
        vi.mocked(certificationsService.uploadDocument).mockRejectedValue(new Error("failed"));
        const user = await renderView();

        await user.click(screen.getByRole("button", { name: "Editar Scrum Master" }));
        await user.clear(screen.getByLabelText(/Nombre de la certificación/));
        await user.type(screen.getByLabelText(/Nombre de la certificación/), "Nuevo nombre");
        await user.upload(screen.getByLabelText(/Archivo de respaldo/), CERTIFICATE_PDF);
        await user.click(screen.getByRole("button", { name: "Guardar certificación" }));

        expect(
          await screen.findByText(CERTIFICATION_DOCUMENT_MESSAGES.uploadError),
        ).toBeInTheDocument();
        expect(screen.getByRole("form", { name: "Editar certificación" })).toBeInTheDocument();
        expect(screen.getByLabelText(/Nombre de la certificación/)).toHaveValue("Nuevo nombre");
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });

    it("opens the attached document in the viewer from the documents list", async () => {
      vi.mocked(certificationsService.getCertifications).mockResolvedValue([
        { ...SCRUM, hasDocument: true },
        AWS,
      ]);
      vi.mocked(certificationsService.getDocument).mockResolvedValue(CERTIFICATE_PDF);
      const openSpy = vi.spyOn(window, "open");
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:certificate");
      const user = await renderView();

      await user.click(screen.getByRole("button", { name: "Ver documento de Scrum Master" }));

      const dialog = await screen.findByRole("dialog");
      expect(certificationsService.getDocument).toHaveBeenCalledWith("scrum");
      expect(within(dialog).getByText(/Scrum Master · Scrum Master\.pdf/)).toBeInTheDocument();
      expect(within(dialog).getByRole("button", { name: "Descargar" })).toBeInTheDocument();
      expect(openSpy).not.toHaveBeenCalled();
    });

    it("opens the viewer from the preview chip of the card and closes it", async () => {
      vi.mocked(certificationsService.getCertifications).mockResolvedValue([
        { ...SCRUM, hasDocument: true },
      ]);
      vi.mocked(certificationsService.getDocument).mockResolvedValue(CERTIFICATE_PDF);
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:certificate");
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
      const user = await renderView();

      await user.click(screen.getByRole("button", { name: "Previsualizar documento de Scrum Master" }));
      const dialog = await screen.findByRole("dialog");
      await user.click(within(dialog).getByRole("button", { name: "Close" }));

      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:certificate");
    });

    it("downloads the file from the viewer without leaving the view", async () => {
      vi.mocked(certificationsService.getCertifications).mockResolvedValue([
        { ...SCRUM, hasDocument: true },
      ]);
      vi.mocked(certificationsService.getDocument).mockResolvedValue(CERTIFICATE_PDF);
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:certificate");
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
      const user = await renderView();

      await user.click(screen.getByRole("button", { name: "Previsualizar documento de Scrum Master" }));
      const dialog = await screen.findByRole("dialog");
      await user.click(within(dialog).getByRole("button", { name: "Descargar" }));

      expect(clickSpy).toHaveBeenCalledTimes(1);
      const link = clickSpy.mock.contexts[0] as HTMLAnchorElement;
      expect(link.download).toBe("Scrum Master.pdf");
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("reports when the attached document cannot be opened", async () => {
      vi.mocked(certificationsService.getCertifications).mockResolvedValue([
        { ...SCRUM, hasDocument: true },
      ]);
      vi.mocked(certificationsService.getDocument).mockRejectedValue(new Error("failed"));
      const user = await renderView();

      await user.click(screen.getByRole("button", { name: "Ver documento de Scrum Master" }));

      expect(await screen.findByRole("alert")).toHaveTextContent(
        CERTIFICATION_DOCUMENT_MESSAGES.openError,
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
