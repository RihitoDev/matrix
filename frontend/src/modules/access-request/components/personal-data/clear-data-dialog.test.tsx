import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccessRequestProvider, useAccessRequestForm } from "../../contexts/access-request-context";
import { accessRequestService } from "../../services/access-request.service";
import type { ApiResult } from "../../types/access-request.types";
import { PersonalDataForm } from "./personal-data-form";

vi.mock("../../services/access-request.service", () => ({
  accessRequestService: {
    createAccessRequest: vi.fn(),
    updateAccessRequest: vi.fn(),
    deleteAccessRequest: vi.fn(),
  },
}));

const create = vi.mocked(accessRequestService.createAccessRequest);
const update = vi.mocked(accessRequestService.updateAccessRequest);
const remove = vi.mocked(accessRequestService.deleteAccessRequest);

const CLEAR = "Limpiar datos";
const SUBMIT_NAME = "Continuar al siguiente paso";
const SHORT_DESCRIPTION = "Se vaciarán todos los campos.";
const DRAFT_DESCRIPTION = "Se vaciarán todos los campos y se eliminará el borrador guardado.";

// Sonda de prueba: el paso 1 ya no muestra aviso de éxito, así que se observa el paso actual del Context
function StepProbe() {
  const { currentStep } = useAccessRequestForm();
  return <p>{`paso-actual:${currentStep}`}</p>;
}

function renderForm() {
  return render(
    <AccessRequestProvider>
      <PersonalDataForm />
      <StepProbe />
    </AccessRequestProvider>,
  );
}

function type(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

async function pick(name: string, option: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole("combobox", { name }));
  await user.click(await screen.findByRole("option", { name: option }));
}

async function fillValidForm() {
  type(/^Nombres/, "Ana María");
  type(/^Apellidos/, "Rojas");
  type(/^Carnet de identidad/, "1234567");
  type(/^Código SIS/, "202012345");
  type(/^Correo electrónico/, "ana@umss.edu.bo");
  type(/^Fecha de nacimiento/, "2000-05-10");
  type(/^Año de titulación/, "2019");
  await pick("Expedido", "LP");
  await pick("Carrera", "Licenciatura en Ingeniería de Sistemas");
}

const failure = (status: number, message: string): ApiResult<never> => ({ ok: false, status, fieldErrors: {}, message });

// Guarda un borrador (envío válido) para que exista draftId
async function saveDraft() {
  create.mockResolvedValueOnce({ ok: true, data: { id: "draft-1" } });
  await userEvent.setup().click(screen.getByRole("button", { name: SUBMIT_NAME }));
  await screen.findByText("paso-actual:2");
}

// Botón del formulario (el del diálogo tiene el mismo nombre pero vive dentro del alertdialog)
const openButton = () => screen.getAllByRole("button", { name: CLEAR })[0];
const confirmButton = (dialog: HTMLElement) => within(dialog).getByRole("button", { name: CLEAR });

describe("ClearDataDialog", () => {
  beforeEach(() => {
    create.mockReset();
    update.mockReset();
    remove.mockReset();
  });
  afterEach(() => cleanup());

  it("muestra el botón Limpiar datos secundario (ghost), de tipo button y a la izquierda del principal", () => {
    const { container } = renderForm();

    const button = screen.getByRole("button", { name: CLEAR });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("hover:bg-muted", "text-ink");
    expect(button).not.toHaveClass("bg-ink", "bg-primary");
    const main = screen.getByRole("button", { name: SUBMIT_NAME });
    expect(button.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(button.parentElement).toBe(main.parentElement);
    expect(container.querySelector("form")).toContainElement(button);
  });

  it("no envía el formulario al pulsarlo", async () => {
    const user = userEvent.setup();
    renderForm();
    await fillValidForm();

    await user.click(screen.getByRole("button", { name: CLEAR }));

    await screen.findByRole("alertdialog");
    expect(create).not.toHaveBeenCalled();
  });

  it("abre un diálogo con el título y la descripción corta cuando no hay borrador", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: CLEAR }));

    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText("¿Limpiar los datos del formulario?")).toBeInTheDocument();
    expect(within(dialog).getByText(SHORT_DESCRIPTION)).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    expect(confirmButton(dialog)).toHaveClass("bg-ink", "text-surface", "hover:bg-ink/90");
  });

  it("cancelar cierra el diálogo y no borra nada ni llama al servicio", async () => {
    const user = userEvent.setup();
    renderForm();
    await fillValidForm();
    await user.click(screen.getByRole("button", { name: CLEAR }));
    const dialog = await screen.findByRole("alertdialog");

    await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(screen.getByLabelText(/^Nombres/)).toHaveValue("Ana María");
    expect(screen.getByLabelText(/^Correo electrónico/)).toHaveValue("ana@umss.edu.bo");
    expect(remove).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("confirmar sin borrador vacía los campos, devuelve los selects a su placeholder y cierra sin llamar al servicio", async () => {
    const user = userEvent.setup();
    renderForm();
    await fillValidForm();
    await user.click(screen.getByRole("button", { name: CLEAR }));
    const dialog = await screen.findByRole("alertdialog");

    await user.click(confirmButton(dialog));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(screen.getByLabelText(/^Nombres/)).toHaveValue("");
    expect(screen.getByLabelText(/^Correo electrónico/)).toHaveValue("");
    expect(screen.getByLabelText(/^Año de titulación/)).toHaveValue("");
    expect(screen.getByRole("combobox", { name: "Expedido" })).toHaveTextContent("Elegir");
    expect(screen.getByRole("combobox", { name: "Carrera" })).toHaveTextContent("Selecciona tu carrera");
    expect(remove).not.toHaveBeenCalled();
    expect(screen.getByText("paso-actual:1")).toBeInTheDocument();
  });

  it("siempre pide confirmación, también con el formulario vacío", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: CLEAR }));

    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
  });

  it("con borrador la descripción lo menciona y confirmar llama a deleteAccessRequest con el id y limpia", async () => {
    remove.mockResolvedValue({ ok: true, data: { id: "draft-1" } });
    const user = userEvent.setup();
    renderForm();
    await fillValidForm();
    await saveDraft();

    await user.click(openButton());
    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText(DRAFT_DESCRIPTION)).toBeInTheDocument();
    await user.click(confirmButton(dialog));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith("draft-1");
    expect(screen.getByLabelText(/^Nombres/)).toHaveValue("");
    expect(screen.getByText("paso-actual:1")).toBeInTheDocument();
  });

  it.each([
    ["409", failure(409, "La solicitud ya fue enviada y no se puede eliminar")],
    ["error de red", failure(0, "No se pudo conectar con el servidor. Inténtalo de nuevo.")],
  ])("si el DELETE falla (%s) el diálogo sigue abierto con el mensaje, conserva los valores y permite reintentar", async (_name, failed) => {
    remove.mockResolvedValueOnce(failed);
    remove.mockResolvedValueOnce({ ok: true, data: { id: "draft-1" } });
    const user = userEvent.setup();
    renderForm();
    await fillValidForm();
    await saveDraft();
    await user.click(openButton());
    const dialog = await screen.findByRole("alertdialog");

    await user.click(confirmButton(dialog));

    const alert = await within(dialog).findByRole("alert");
    expect(alert).toHaveTextContent(failed.ok ? "" : failed.message);
    expect(alert).toHaveClass("text-destructive");
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Nombres/)).toHaveValue("Ana María");

    await user.click(confirmButton(dialog));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(remove).toHaveBeenCalledTimes(2);
    expect(screen.getByLabelText(/^Nombres/)).toHaveValue("");
  });

  it("al cancelar tras un error se borra el mensaje de error", async () => {
    remove.mockResolvedValueOnce(failure(0, "sin red"));
    const user = userEvent.setup();
    renderForm();
    await fillValidForm();
    await saveDraft();
    await user.click(openButton());
    const dialog = await screen.findByRole("alertdialog");
    await user.click(confirmButton(dialog));
    await within(dialog).findByText("sin red");

    await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    await user.click(openButton());

    const reopened = await screen.findByRole("alertdialog");
    expect(within(reopened).queryByText("sin red")).toBeNull();
  });

  it("deshabilita el botón mientras se envía", async () => {
    let resolve!: (value: ApiResult<{ id: string }>) => void;
    create.mockReturnValue(new Promise((done) => (resolve = done)));
    const user = userEvent.setup();
    renderForm();
    await fillValidForm();

    await user.click(screen.getByRole("button", { name: SUBMIT_NAME }));

    expect(await screen.findByRole("button", { name: CLEAR })).toBeDisabled();

    await act(async () => resolve({ ok: true, data: { id: "draft-1" } }));
    await waitFor(() => expect(screen.getByRole("button", { name: CLEAR })).toBeEnabled());
  });

  it("mientras limpia deshabilita los botones, muestra Limpiando... y no se cierra con Escape; un doble clic hace una sola llamada", async () => {
    let resolve!: (value: ApiResult<{ id?: string }>) => void;
    remove.mockReturnValue(new Promise((done) => (resolve = done)));
    const user = userEvent.setup();
    renderForm();
    await fillValidForm();
    await saveDraft();
    await user.click(openButton());
    const dialog = await screen.findByRole("alertdialog");

    await user.dblClick(confirmButton(dialog));

    const busy = await within(dialog).findByRole("button", { name: "Limpiando..." });
    expect(busy).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "Cancelar" })).toBeDisabled();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(remove).toHaveBeenCalledTimes(1);

    await act(async () => resolve({ ok: true, data: { id: "draft-1" } }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it("no usa el término egresado en los textos nuevos", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: CLEAR }));
    const dialog = await screen.findByRole("alertdialog");

    expect(dialog.textContent).not.toMatch(/egres/i);
  });
});
