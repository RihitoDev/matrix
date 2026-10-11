import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requestReviewService } from "../../services/request-review.service";
import { detail } from "./data-contrast-panel.test";
import { VerdictPanel } from "./verdict-panel";

const approveRequest = vi.spyOn(requestReviewService, "approveRequest");
const rejectRequest = vi.spyOn(requestReviewService, "rejectRequest");

function setup(status: "pending" | "in_review" | "approved" | "rejected" = "in_review") {
  const onStatusChange = vi.fn();
  render(<VerdictPanel detail={detail} status={status} onStatusChange={onStatusChange} />);
  return { onStatusChange };
}

describe("VerdictPanel", () => {
  beforeEach(() => {
    approveRequest.mockReset();
    rejectRequest.mockReset();
  });
  afterEach(() => cleanup());

  it("en revisión muestra el botón Aprobar solicitud y pide confirmación antes de aprobar", async () => {
    setup();

    fireEvent.click(screen.getByRole("button", { name: "Aprobar solicitud" }));

    expect(await screen.findByText("¿Aprobar la solicitud?")).toBeInTheDocument();
    expect(screen.getByText(/Se enviará el código de activación al correo del titulado \(jose@umss.test\)/)).toBeInTheDocument();
    expect(approveRequest).not.toHaveBeenCalled();
  });

  it("cancelar el diálogo no aprueba nada", async () => {
    const { onStatusChange } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Aprobar solicitud" }));

    fireEvent.click(await screen.findByRole("button", { name: "Cancelar" }));

    await waitFor(() => expect(screen.queryByText("¿Aprobar la solicitud?")).toBeNull());
    expect(approveRequest).not.toHaveBeenCalled();
    expect(onStatusChange).not.toHaveBeenCalled();
  });

  it("al confirmar aprueba, cambia el estado y avisa que se envió el código", async () => {
    approveRequest.mockResolvedValue({ ok: true, data: { id: "id-1", status: "approved", activationCodeSent: true } });
    const { onStatusChange } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Aprobar solicitud" }));

    fireEvent.click(await screen.findByRole("button", { name: "Aprobar y enviar código" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Solicitud aprobada. Se envió el código de activación al correo del titulado.");
    expect(approveRequest).toHaveBeenCalledWith("id-1");
    expect(onStatusChange).toHaveBeenCalledWith("approved");
  });

  it("si el código no se pudo enviar lo dice, pero la solicitud queda aprobada", async () => {
    approveRequest.mockResolvedValue({ ok: true, data: { id: "id-1", status: "approved", activationCodeSent: false } });
    const { onStatusChange } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Aprobar solicitud" }));
    fireEvent.click(await screen.findByRole("button", { name: "Aprobar y enviar código" }));

    expect(await screen.findByRole("status")).toHaveTextContent("no se pudo enviar el código de activación");
    expect(onStatusChange).toHaveBeenCalledWith("approved");
  });

  it("un error del servidor se muestra en español y no cambia el estado", async () => {
    approveRequest.mockResolvedValue({ ok: false, status: 409, message: "La solicitud no está en revisión" });
    const { onStatusChange } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Aprobar solicitud" }));
    fireEvent.click(await screen.findByRole("button", { name: "Aprobar y enviar código" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("La solicitud no está en revisión");
    expect(onStatusChange).not.toHaveBeenCalled();
  });

  it.each(["pending", "approved", "rejected"] as const)("con la solicitud %s no hay botón de aprobar", (status) => {
    setup(status);
    expect(screen.queryByRole("button", { name: "Aprobar solicitud" })).toBeNull();
    expect(screen.getByText("Esta solicitud ya no admite un dictamen.")).toBeInTheDocument();
  });

  describe("rechazar", () => {
    async function openRejectDialog() {
      fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));
      return screen.findByLabelText("Indicación para el solicitante");
    }
    const choose = (label: string) => fireEvent.click(screen.getByRole("radio", { name: label }));
    const confirm = () => screen.getByRole("button", { name: "Rechazar y notificar" });

    it("muestra los cinco motivos predefinidos y el botón deshabilitado hasta elegir uno", async () => {
      setup();
      await openRejectDialog();

      for (const label of [
        "Documento ilegible",
        "El nombre no coincide con los datos declarados",
        "Documento incompleto o recortado",
        "El documento no corresponde a la carrera",
        "Otro motivo",
      ]) {
        expect(screen.getByRole("radio", { name: label })).toBeInTheDocument();
      }
      expect(confirm()).toBeDisabled();
      expect(screen.getByText("0/500")).toBeInTheDocument();
      choose("Documento ilegible");
      expect(confirm()).toBeEnabled();
    });

    it("Otro motivo exige una indicación no vacía ni solo con espacios", async () => {
      setup();
      const hint = await openRejectDialog();
      choose("Otro motivo");

      expect(confirm()).toBeDisabled();
      fireEvent.change(hint, { target: { value: "     " } });
      expect(confirm()).toBeDisabled();
      expect(screen.getByRole("alert")).toHaveTextContent("Escribe la indicación para el solicitante");
      fireEvent.change(hint, { target: { value: "Falta el sello" } });
      expect(confirm()).toBeEnabled();
    });

    it.each([
      ["Documento ilegible", "", "Documento ilegible"],
      ["El nombre no coincide con los datos declarados", "Revisa tu nombre", "El nombre no coincide con los datos declarados. Revisa tu nombre"],
      ["Otro motivo", "  Falta el sello  ", "Otro motivo. Falta el sello"],
    ])("con el motivo %s envía UNA sola cadena", async (option, hintText, expected) => {
      rejectRequest.mockResolvedValue({ ok: true, data: { id: "id-1", status: "rejected", notificationSent: true } });
      const { onStatusChange } = setup();
      const hint = await openRejectDialog();
      choose(option);
      if (hintText) fireEvent.change(hint, { target: { value: hintText } });

      fireEvent.click(confirm());

      expect(await screen.findByRole("status")).toHaveTextContent("Solicitud rechazada. Se notificó al titulado con el motivo.");
      expect(rejectRequest).toHaveBeenCalledTimes(1);
      expect(rejectRequest).toHaveBeenCalledWith("id-1", expected);
      expect(onStatusChange).toHaveBeenCalledWith("rejected");
    });

    it("muestra el contador y bloquea el envío si pasa de 500 caracteres", async () => {
      setup();
      const hint = await openRejectDialog();
      choose("Documento ilegible");

      fireEvent.change(hint, { target: { value: "a".repeat(500 - "Documento ilegible. ".length) } });
      expect(screen.getByText("500/500")).toBeInTheDocument();
      expect(confirm()).toBeEnabled();

      fireEvent.change(hint, { target: { value: "a".repeat(501 - "Documento ilegible. ".length) } });
      expect(screen.getByText("501/500")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveTextContent("El motivo no puede superar los 500 caracteres");
      expect(confirm()).toBeDisabled();
    });

    it("si el correo no se pudo enviar lo dice, pero la solicitud queda rechazada", async () => {
      rejectRequest.mockResolvedValue({ ok: true, data: { id: "id-1", status: "rejected", notificationSent: false } });
      const { onStatusChange } = setup();
      await openRejectDialog();
      choose("Documento ilegible");
      fireEvent.click(confirm());

      expect(await screen.findByRole("status")).toHaveTextContent("no se pudo enviar el correo");
      expect(onStatusChange).toHaveBeenCalledWith("rejected");
    });

    it("un error del servidor se muestra en español dentro del diálogo y no cambia el estado", async () => {
      rejectRequest.mockResolvedValue({ ok: false, status: 409, message: "La solicitud no está en revisión" });
      const { onStatusChange } = setup();
      await openRejectDialog();
      choose("Documento ilegible");
      fireEvent.click(confirm());

      expect(await screen.findByRole("alert")).toHaveTextContent("La solicitud no está en revisión");
      expect(onStatusChange).not.toHaveBeenCalled();
    });

    it("cancelar limpia el motivo y la indicación y no rechaza nada", async () => {
      const { onStatusChange } = setup();
      const hint = await openRejectDialog();
      choose("Documento ilegible");
      fireEvent.change(hint, { target: { value: "A medias" } });

      fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
      await waitFor(() => expect(screen.queryByLabelText("Indicación para el solicitante")).toBeNull());
      expect(await openRejectDialog()).toHaveValue("");
      expect(confirm()).toBeDisabled();

      expect(rejectRequest).not.toHaveBeenCalled();
      expect(onStatusChange).not.toHaveBeenCalled();
    });
  });

  describe("diseño del dictamen y del diálogo", () => {
    it("Aprobar es el botón primario de tinta y Rechazar el de contorno rojo, lado a lado", () => {
      setup();
      expect(screen.getByRole("button", { name: "Aprobar solicitud" })).toHaveClass("bg-ink", "text-surface");
      expect(screen.getByRole("button", { name: "Rechazar" })).toHaveClass("border-accent", "text-accent");
    });

    it("el diálogo muestra el nombre, el botón de cerrar y las tarjetas de motivo; la elegida va en rojo tenue", async () => {
      setup();
      fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));
      await screen.findByLabelText("Indicación para el solicitante");

      expect(screen.getByText(/José Luis Pérez recibirá este motivo por correo/)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cerrar" })).toBeInTheDocument();
      const card = screen.getByText("Documento ilegible").closest("label");
      expect(card).toHaveClass("border-border");
      fireEvent.click(screen.getByRole("radio", { name: "Documento ilegible" }));
      expect(screen.getByText("Documento ilegible").closest("label")).toHaveClass("bg-interaction", "border-accent");
    });

    it("Rechazar y notificar es rojo y queda gris deshabilitado sin motivo válido", async () => {
      setup();
      fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));
      await screen.findByLabelText("Indicación para el solicitante");
      const confirmButton = screen.getByRole("button", { name: "Rechazar y notificar" });

      expect(confirmButton).toBeDisabled();
      expect(confirmButton).toHaveClass("bg-accent", "text-surface", "disabled:bg-border");
    });

    it("el botón Cerrar cierra el diálogo sin rechazar", async () => {
      setup();
      fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));
      await screen.findByLabelText("Indicación para el solicitante");

      fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));

      await waitFor(() => expect(screen.queryByLabelText("Indicación para el solicitante")).toBeNull());
      expect(rejectRequest).not.toHaveBeenCalled();
    });
  });
});
