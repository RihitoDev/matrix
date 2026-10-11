import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccessRequestProvider } from "../../contexts/access-request-context";
import { accessRequestService } from "../../services/access-request.service";
import type { ApiResult } from "../../types/access-request.types";
import { PersonalDataForm } from "./personal-data-form";

vi.mock("../../services/access-request.service", () => ({
  accessRequestService: { createAccessRequest: vi.fn(), updateAccessRequest: vi.fn() },
}));

const create = vi.mocked(accessRequestService.createAccessRequest);
const SUBMIT_NAME = "Continuar al siguiente paso";

function renderForm() {
  return render(
    <AccessRequestProvider>
      <PersonalDataForm />
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

// Llena todo con datos válidos, salvo lo que se omita
async function fillForm(skip: string[] = []) {
  const text: Array<[string, RegExp, string]> = [
    ["firstName", /^Nombres/, "Ana María"],
    ["lastName", /^Apellidos/, "Rojas"],
    ["idCardNumber", /^Carnet de identidad/, "1234567"],
    ["sisCode", /^Código SIS/, "202012345"],
    ["email", /^Correo electrónico/, "ana@umss.edu.bo"],
    ["birthDate", /^Fecha de nacimiento/, "2000-05-10"],
    ["graduationYear", /^Año de titulación/, "2019"],
  ];
  for (const [field, label, value] of text) if (!skip.includes(field)) type(label, value);
  if (!skip.includes("idCardIssuedIn")) await pick("Expedido", "LP");
  if (!skip.includes("career")) await pick("Carrera", "Licenciatura en Ingeniería de Sistemas");
}

const submitForm = () => userEvent.setup().click(screen.getByRole("button", { name: SUBMIT_NAME }));

const failure = (status: number, message: string, fieldErrors = {}): ApiResult<never> => ({ ok: false, status, fieldErrors, message });

describe("PersonalDataForm: foco en el primer campo con error", () => {
  beforeEach(() => create.mockReset());
  afterEach(() => cleanup());

  it("con el formulario vacío enfoca el primer campo (Nombres)", async () => {
    renderForm();

    await submitForm();

    expect(screen.getByLabelText(/^Nombres/)).toHaveFocus();
    expect(screen.getByLabelText(/^Nombres/)).toHaveAttribute("aria-invalid", "true");
  });

  it("con un solo error de texto enfoca ese campo", async () => {
    renderForm();
    await fillForm(["email"]);
    type(/^Correo electrónico/, "no-es-correo");

    await submitForm();

    expect(screen.getByLabelText(/^Correo electrónico/)).toHaveFocus();
    expect(create).not.toHaveBeenCalled();
  });

  it("con varios errores enfoca el primero en el orden visual, no el último ni el primero en el DOM de otro orden", async () => {
    renderForm();
    await fillForm(["sisCode", "birthDate", "graduationYear"]);
    type(/^Código SIS/, "abc");
    type(/^Fecha de nacimiento/, "2020-01-01");
    type(/^Año de titulación/, "2099");

    await submitForm();

    expect(screen.getByLabelText(/^Código SIS/)).toHaveFocus();
    expect(screen.getByLabelText(/^Fecha de nacimiento/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/^Año de titulación/)).toHaveAttribute("aria-invalid", "true");
  });

  it("si el primer error es el teléfono, queda por delante de la fecha de nacimiento", async () => {
    renderForm();
    await fillForm(["birthDate"]);
    type(/Teléfono/, "123");
    type(/^Fecha de nacimiento/, "2020-01-01");

    await submitForm();

    expect(screen.getByLabelText(/Teléfono/)).toHaveFocus();
  });

  it("enfoca el disparador del select Expedido cuando es el primer error", async () => {
    renderForm();
    await fillForm(["idCardIssuedIn"]);

    await submitForm();

    const trigger = screen.getByRole("combobox", { name: "Expedido" });
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-invalid", "true");
  });

  it("enfoca el disparador del select Carrera cuando es el único error", async () => {
    renderForm();
    await fillForm(["career"]);

    await submitForm();

    const trigger = screen.getByRole("combobox", { name: "Carrera" });
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-invalid", "true");
  });

  it("Expedido va antes que Código SIS aunque ambos tengan error", async () => {
    renderForm();
    await fillForm(["idCardIssuedIn", "sisCode"]);
    type(/^Código SIS/, "abc");

    await submitForm();

    expect(screen.getByRole("combobox", { name: "Expedido" })).toHaveFocus();
  });

  it("con un error solo del servidor (409 en el correo) enfoca el correo", async () => {
    create.mockResolvedValue(failure(409, "El correo ya está registrado", { email: "El correo ya está registrado" }));
    renderForm();
    await fillForm();

    await submitForm();

    expect(await screen.findByText("El correo ya está registrado", { selector: "p[id='email-error']" })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Correo electrónico/)).toHaveFocus();
  });

  it("con errores del servidor en varios campos (400) enfoca el primero en el orden visual", async () => {
    create.mockResolvedValue(
      failure(400, "Revisa los campos marcados", { career: "La carrera no es válida", sisCode: "El código SIS solo puede contener dígitos" }),
    );
    renderForm();
    await fillForm();

    await submitForm();

    await screen.findByText("La carrera no es válida");
    expect(screen.getByLabelText(/^Código SIS/)).toHaveFocus();
  });

  it("un error del servidor en el select Carrera enfoca su disparador", async () => {
    create.mockResolvedValue(failure(400, "Revisa los campos marcados", { career: "La carrera no es válida" }));
    renderForm();
    await fillForm();

    await submitForm();

    await screen.findByText("La carrera no es válida");
    expect(screen.getByRole("combobox", { name: "Carrera" })).toHaveFocus();
  });

  it("un error del servidor sin campo (aviso general) no mueve el foco a ningún campo", async () => {
    create.mockResolvedValue(failure(500, "No se pudo completar la solicitud. Inténtalo de nuevo."));
    renderForm();
    await fillForm();

    await submitForm();

    await screen.findByText("No se pudo completar la solicitud. Inténtalo de nuevo.");
    expect(screen.getByRole("button", { name: SUBMIT_NAME })).toHaveFocus();
  });

  it("sin errores el foco no se mueve a ningún campo", async () => {
    create.mockResolvedValue({ ok: true, data: { id: "draft-1" } });
    renderForm();
    await fillForm();

    await submitForm();

    expect(create).toHaveBeenCalledTimes(1);
    const button = screen.getByRole("button", { name: SUBMIT_NAME });
    expect(button).toHaveFocus();
  });

  it("al corregir un campo no se vuelve a mover el foco hasta el siguiente envío", async () => {
    renderForm();
    await submitForm();
    expect(screen.getByLabelText(/^Nombres/)).toHaveFocus();

    screen.getByLabelText(/^Correo electrónico/).focus();
    type(/^Nombres/, "Ana");

    expect(screen.getByLabelText(/^Correo electrónico/)).toHaveFocus();
  });

  it("un segundo envío inválido vuelve a enfocar el primer error", async () => {
    renderForm();
    await submitForm();
    screen.getByLabelText(/^Correo electrónico/).focus();

    await submitForm();

    expect(screen.getByLabelText(/^Nombres/)).toHaveFocus();
  });
});

describe("PersonalDataForm: criterios de #500 en el formulario", () => {
  beforeEach(() => create.mockReset());
  afterEach(() => cleanup());

  it("un nombre con números y un código SIS con letras muestran su error y no se avanza", async () => {
    renderForm();
    await fillForm(["firstName", "sisCode"]);
    type(/^Nombres/, "Ana2");
    type(/^Código SIS/, "20A12");

    await submitForm();

    expect(screen.getByText("Los nombres solo pueden contener letras y espacios")).toBeInTheDocument();
    expect(screen.getByText("El código SIS solo puede contener dígitos")).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });

  it("un correo y un teléfono inválidos muestran su error", async () => {
    renderForm();
    await fillForm(["email"]);
    type(/^Correo electrónico/, "no-es-correo");
    type(/Teléfono/, "123");

    await submitForm();

    expect(screen.getByText("El correo no tiene un formato válido")).toBeInTheDocument();
    expect(screen.getByText("El teléfono debe tener entre 6 y 8 dígitos")).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });

  it("una persona menor de 18 años no puede continuar", async () => {
    renderForm();
    await fillForm(["birthDate"]);
    const now = new Date();
    type(/^Fecha de nacimiento/, `${now.getFullYear() - 10}-01-01`);

    await submitForm();

    expect(screen.getByText("Debes ser mayor de 18 años")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Fecha de nacimiento/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/^Fecha de nacimiento/)).toHaveFocus();
    expect(create).not.toHaveBeenCalled();
  });

  it("un año de titulación futuro muestra su error", async () => {
    renderForm();
    await fillForm(["graduationYear"]);
    type(/^Año de titulación/, String(new Date().getFullYear() + 1));

    await submitForm();

    expect(screen.getByText("El año de titulación no puede ser futuro")).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });

  it("con datos vacíos no se avanza y se resaltan los nueve campos obligatorios con su mensaje", async () => {
    renderForm();

    await submitForm();

    expect(create).not.toHaveBeenCalled();
    const invalid = document.querySelectorAll("[aria-invalid='true']");
    expect(invalid.length).toBe(9);
    expect(screen.getByText("Los nombres son obligatorios")).toBeInTheDocument();
    expect(screen.getByText("El correo es obligatorio")).toBeInTheDocument();
  });
});
