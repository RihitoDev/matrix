import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccessRequestProvider, useAccessRequestForm } from "../../contexts/access-request-context";
import { accessRequestService } from "../../services/access-request.service";
import type { ApiResult } from "../../types/access-request.types";
import { PersonalDataForm } from "./personal-data-form";

vi.mock("../../services/access-request.service", () => ({
  accessRequestService: { createAccessRequest: vi.fn(), updateAccessRequest: vi.fn() },
}));

const create = vi.mocked(accessRequestService.createAccessRequest);
const update = vi.mocked(accessRequestService.updateAccessRequest);

const SUBMIT_NAME = "Continuar al siguiente paso";

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

const failure = (status: number, message: string, fieldErrors = {}): ApiResult<never> => ({
  ok: false,
  status,
  fieldErrors,
  message,
});

describe("PersonalDataForm: guardado del borrador", () => {
  beforeEach(() => {
    create.mockReset();
    update.mockReset();
  });
  afterEach(() => cleanup());

  it("un envío inválido muestra errores por campo y no llama al servicio", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: SUBMIT_NAME }));

    expect(screen.getByText("Los nombres son obligatorios")).toBeInTheDocument();
    expect(screen.getByText("El correo es obligatorio")).toBeInTheDocument();
    expect(screen.getAllByText("La carrera no es válida")).toHaveLength(1);
    expect(screen.getByLabelText(/^Nombres/)).toHaveAttribute("aria-invalid", "true");
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("al editar un campo se borra su propio error y no el de los demás", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: SUBMIT_NAME }));

    type(/^Nombres/, "Ana");

    expect(screen.queryByText("Los nombres son obligatorios")).toBeNull();
    expect(screen.getByText("Los apellidos son obligatorios")).toBeInTheDocument();
  });

  it("el primer envío válido llama a create una vez con el payload armado y avanza al paso 2", async () => {
    create.mockResolvedValue({ ok: true, data: { id: "draft-1" } });
    const user = userEvent.setup();
    renderForm();
    await fillValidForm();

    await user.click(screen.getByRole("button", { name: SUBMIT_NAME }));

    await screen.findByText("paso-actual:2");
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      firstName: "Ana María",
      lastName: "Rojas",
      idCardNumber: "1234567",
      idCardIssuedIn: "LP",
      sisCode: "202012345",
      email: "ana@umss.edu.bo",
      birthDate: "2000-05-10",
      graduationYear: 2019,
      career: "Licenciatura en Ingeniería de Sistemas",
    });
    expect(update).not.toHaveBeenCalled();
  });

  it("el segundo envío llama a update con el id del borrador", async () => {
    create.mockResolvedValue({ ok: true, data: { id: "draft-1" } });
    update.mockResolvedValue({ ok: true, data: {} });
    const user = userEvent.setup();
    renderForm();
    await fillValidForm();
    await user.click(screen.getByRole("button", { name: SUBMIT_NAME }));
    await screen.findByText("paso-actual:2");

    type(/Teléfono/, "");
    await user.click(screen.getByRole("button", { name: SUBMIT_NAME }));

    await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
    expect(update.mock.calls[0][0]).toBe("draft-1");
    expect(update.mock.calls[0][1]).toMatchObject({ phone: null, firstName: "Ana María" });
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("mientras envía deshabilita el botón, muestra Guardando... y un doble envío hace una sola llamada", async () => {
    let resolve!: (value: ApiResult<{ id: string }>) => void;
    create.mockReturnValue(new Promise((done) => (resolve = done)));
    const user = userEvent.setup();
    const { container } = renderForm();
    await fillValidForm();
    const form = container.querySelector("form") as HTMLFormElement;

    fireEvent.submit(form);
    fireEvent.submit(form);

    const button = await screen.findByRole("button", { name: "Guardando..." });
    expect(button).toBeDisabled();
    expect(create).toHaveBeenCalledTimes(1);
    await user.dblClick(button);
    expect(create).toHaveBeenCalledTimes(1);

    await act(async () => resolve({ ok: true, data: { id: "draft-1" } }));
    expect(await screen.findByRole("button", { name: SUBMIT_NAME })).toBeEnabled();
  });

  it("un 409 muestra el mensaje bajo correo, carnet y código SIS, y uno general sobre el botón", async () => {
    const detail = "El correo, el carnet de identidad y el código SIS ya están registrados";
    create.mockResolvedValue(failure(409, detail, { email: detail, idCardNumber: detail, sisCode: detail }));
    const user = userEvent.setup();
    renderForm();
    await fillValidForm();

    await user.click(screen.getByRole("button", { name: SUBMIT_NAME }));

    await waitFor(() => expect(screen.getAllByText(detail)).toHaveLength(4));
    expect(screen.getByLabelText(/^Correo electrónico/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/^Carnet de identidad/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/^Código SIS/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent(detail);
    expect(screen.getByLabelText(/^Nombres/)).not.toHaveAttribute("aria-invalid");
  });

  it("tras un 2xx inválido (status 0, sin id) no queda draftId y el reintento crea", async () => {
    create.mockResolvedValueOnce(failure(0, "No se pudo completar la solicitud. Inténtalo de nuevo."));
    create.mockResolvedValueOnce({ ok: true, data: { id: "draft-1" } });
    const user = userEvent.setup();
    renderForm();
    await fillValidForm();

    await user.click(screen.getByRole("button", { name: SUBMIT_NAME }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo completar la solicitud. Inténtalo de nuevo.");
    await user.click(screen.getByRole("button", { name: SUBMIT_NAME }));

    await waitFor(() => expect(create).toHaveBeenCalledTimes(2));
    expect(update).not.toHaveBeenCalled();
  });

  it("un 404 borra el id y el siguiente envío crea un borrador nuevo", async () => {
    create.mockResolvedValueOnce({ ok: true, data: { id: "draft-1" } });
    update.mockResolvedValueOnce(failure(404, "La solicitud ya no existe"));
    create.mockResolvedValueOnce({ ok: true, data: { id: "draft-2" } });
    const user = userEvent.setup();
    renderForm();
    await fillValidForm();
    await user.click(screen.getByRole("button", { name: SUBMIT_NAME }));
    await screen.findByText("paso-actual:2");

    await user.click(screen.getByRole("button", { name: SUBMIT_NAME }));
    await screen.findByText("La solicitud ya no existe");
    expect(update).toHaveBeenCalledWith("draft-1", expect.any(Object));

    await user.click(screen.getByRole("button", { name: SUBMIT_NAME }));

    await waitFor(() => expect(create).toHaveBeenCalledTimes(2));
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("un error de red muestra el mensaje, conserva los valores y reintenta con create", async () => {
    create.mockResolvedValueOnce(failure(0, "No se pudo conectar con el servidor. Inténtalo de nuevo."));
    create.mockResolvedValueOnce({ ok: true, data: { id: "draft-1" } });
    const user = userEvent.setup();
    renderForm();
    await fillValidForm();

    await user.click(screen.getByRole("button", { name: SUBMIT_NAME }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    expect(screen.getByLabelText(/^Nombres/)).toHaveValue("Ana María");
    expect(screen.getByLabelText(/^Correo electrónico/)).toHaveValue("ana@umss.edu.bo");
    expect(screen.getByRole("combobox", { name: "Carrera" })).toHaveTextContent("Licenciatura en Ingeniería de Sistemas");

    await user.click(screen.getByRole("button", { name: SUBMIT_NAME }));

    await waitFor(() => expect(create).toHaveBeenCalledTimes(2));
  });

  it("muestra el error del servidor en los selects bajo su campo", async () => {
    create.mockResolvedValue(failure(400, "Revisa los campos marcados", { career: "La carrera no es válida", idCardIssuedIn: "El departamento de expedición no es válido" }));
    const user = userEvent.setup();
    renderForm();
    await fillValidForm();

    await user.click(screen.getByRole("button", { name: SUBMIT_NAME }));

    expect(await screen.findByText("El departamento de expedición no es válido")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Carrera" })).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("combobox", { name: "Expedido" })).toHaveAttribute("aria-invalid", "true");
  });
});

describe("useAccessRequestForm", () => {
  it("lanza un error fuera del proveedor", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    function Probe() {
      useAccessRequestForm();
      return null;
    }

    expect(() => render(<Probe />)).toThrow("useAccessRequestForm debe usarse dentro de AccessRequestProvider");
    spy.mockRestore();
  });
});
