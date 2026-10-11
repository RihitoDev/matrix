import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccessRequestProvider } from "../../contexts/access-request-context";
import { accessRequestService } from "../../services/access-request.service";
import type { ApiResult } from "../../types/access-request.types";
import { PersonalDataForm } from "../personal-data/personal-data-form";
import { PublicHeader } from "./public-header";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

vi.mock("../../services/access-request.service", () => ({
  accessRequestService: {
    createAccessRequest: vi.fn(),
    updateAccessRequest: vi.fn(),
    deleteAccessRequest: vi.fn(),
  },
}));

const create = vi.mocked(accessRequestService.createAccessRequest);

const SUBMIT_NAME = "Continuar al siguiente paso";

// React escucha en la raíz: para ver el defaultPrevented final hay que observar el clic más arriba, en document
function watchPrevented() {
  const state = { prevented: false };
  const listener = (event: Event) => {
    state.prevented = event.defaultPrevented;
    event.preventDefault();
  };
  document.addEventListener("click", listener);
  return { state, stop: () => document.removeEventListener("click", listener) };
}

function renderPage() {
  return render(
    <AccessRequestProvider>
      <PublicHeader />
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

describe("PublicHeader", () => {
  beforeEach(() => {
    push.mockReset();
    create.mockReset();
  });
  afterEach(() => cleanup());

  it("muestra ¿Ya tienes cuenta? y un enlace Iniciar sesión hacia /login", () => {
    renderPage();

    const header = screen.getByRole("banner");
    expect(within(header).getByText(/¿Ya tienes cuenta\?/)).toBeInTheDocument();
    const link = within(header).getByRole("link", { name: "Iniciar sesión" });
    expect(link).toHaveAttribute("href", "/login");
    expect(header).toHaveClass("justify-end");
  });

  it("sin datos el clic no abre el diálogo ni llama a push (navega el Link)", async () => {
    const user = userEvent.setup();
    renderPage();
    const link = screen.getByRole("link", { name: "Iniciar sesión" });
    const { state, stop } = watchPrevented();

    await user.click(link);
    stop();

    expect(state.prevented).toBe(false);
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });

  it("con un campo con valor el clic abre el diálogo con título y descripción y no llama a push", async () => {
    const user = userEvent.setup();
    renderPage();
    type(/^Nombres/, "Ana");

    await user.click(screen.getByRole("link", { name: "Iniciar sesión" }));

    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText("¿Salir del formulario?")).toBeInTheDocument();
    expect(within(dialog).getByText("Si sales, se perderán los datos ingresados")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Salir" })).toHaveClass("bg-ink", "text-surface", "hover:bg-ink/90");
    expect(push).not.toHaveBeenCalled();
  });

  it("frena la navegación del enlace cuando hay datos", async () => {
    const user = userEvent.setup();
    renderPage();
    type(/^Nombres/, "Ana");
    const link = screen.getByRole("link", { name: "Iniciar sesión" });
    const { state, stop } = watchPrevented();

    await user.click(link);
    stop();

    expect(state.prevented).toBe(true);
  });

  it("un campo solo con espacios cuenta como vacío y no abre el diálogo", async () => {
    const user = userEvent.setup();
    renderPage();
    type(/^Nombres/, "   ");

    await user.click(screen.getByRole("link", { name: "Iniciar sesión" }));

    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });

  it("cancelar cierra el diálogo, no llama a push y los datos siguen en el formulario", async () => {
    const user = userEvent.setup();
    renderPage();
    await fillValidForm();
    await user.click(screen.getByRole("link", { name: "Iniciar sesión" }));
    const dialog = await screen.findByRole("alertdialog");

    await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/^Nombres/)).toHaveValue("Ana María");
    expect(screen.getByLabelText(/^Correo electrónico/)).toHaveValue("ana@umss.edu.bo");
  });

  it("Salir llama a push('/login') una vez y cierra el diálogo", async () => {
    const user = userEvent.setup();
    renderPage();
    type(/^Nombres/, "Ana");
    await user.click(screen.getByRole("link", { name: "Iniciar sesión" }));
    const dialog = await screen.findByRole("alertdialog");

    await user.click(within(dialog).getByRole("button", { name: "Salir" }));

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/login");
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  });

  it("mientras se envía el clic no abre el diálogo ni llama a push", async () => {
    let resolve!: (value: ApiResult<{ id: string }>) => void;
    create.mockReturnValue(new Promise((done) => (resolve = done)));
    const user = userEvent.setup();
    renderPage();
    await fillValidForm();
    await user.click(screen.getByRole("button", { name: SUBMIT_NAME }));
    await screen.findByRole("button", { name: "Guardando..." });
    const link = screen.getByRole("link", { name: "Iniciar sesión" });
    const { state, stop } = watchPrevented();

    await user.click(link);
    stop();

    expect(state.prevented).toBe(true);
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(push).not.toHaveBeenCalled();

    await act(async () => resolve({ ok: true, data: { id: "draft-1" } }));
  });

  it("no usa el término egresado en los textos nuevos", async () => {
    const user = userEvent.setup();
    renderPage();
    type(/^Nombres/, "Ana");
    const header = screen.getByRole("banner");

    await user.click(screen.getByRole("link", { name: "Iniciar sesión" }));
    const dialog = await screen.findByRole("alertdialog");

    expect(header.textContent).not.toMatch(/egres/i);
    expect(dialog.textContent).not.toMatch(/egres/i);
  });
});
