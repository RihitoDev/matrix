import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { accessRequestService } from "../services/access-request.service";
import { stubObjectUrls } from "../components/document/document-step-test-utils";
import { RequestAccessView } from "./request-access-view";

vi.mock("../services/access-request.service", () => ({
  accessRequestService: {
    createAccessRequest: vi.fn(),
    updateAccessRequest: vi.fn(),
    deleteAccessRequest: vi.fn(),
    uploadDocument: vi.fn(),
    removeDocument: vi.fn(),
    submitAccessRequest: vi.fn(),
    getRequestStatus: vi.fn(),
  },
}));

const create = vi.mocked(accessRequestService.createAccessRequest);

function type(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

async function pick(name: string, option: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole("combobox", { name }));
  await user.click(await screen.findByRole("option", { name: option }));
}

async function fillAndContinue() {
  type(/^Nombres/, "Ana María");
  type(/^Apellidos/, "Rojas");
  type(/^Carnet de identidad/, "1234567");
  type(/^Código SIS/, "202012345");
  type(/^Correo electrónico/, "ana@umss.edu.bo");
  type(/^Fecha de nacimiento/, "2000-05-10");
  type(/^Año de titulación/, "2019");
  await pick("Expedido", "LP");
  await pick("Carrera", "Licenciatura en Ingeniería de Sistemas");
  await userEvent.setup().click(screen.getByRole("button", { name: "Continuar al siguiente paso" }));
  await screen.findByRole("heading", { name: "Documento de respaldo" });
}

// El encabezado usa useRouter, que necesita el App Router montado
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("RequestAccessView", () => {
  beforeEach(() => {
    for (const mock of Object.values(accessRequestService)) vi.mocked(mock).mockReset();
    stubObjectUrls();
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renderiza la barra de pasos y el formulario del paso 1", () => {
    render(<RequestAccessView />);

    expect(screen.getByRole("navigation", { name: "Pasos de la solicitud" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Solicita tu acceso a la comunidad" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")[0]).toHaveAttribute("aria-current", "step");
  });

  it("apila la barra arriba por debajo de lg y la pone al lado desde lg", () => {
    const { container } = render(<RequestAccessView />);

    const layout = container.querySelector("main > div");
    expect(layout).toHaveClass("flex", "min-h-screen", "flex-col", "lg:flex-row");
  });

  it("deja el formulario ocupando el espacio restante y centrado verticalmente", () => {
    const { container } = render(<RequestAccessView />);

    const section = container.querySelector("section");
    expect(section).toHaveClass("flex-1", "flex-col", "justify-center");
  });

  it("centra horizontalmente el contenido con un ancho máximo", () => {
    const { container } = render(<RequestAccessView />);

    const wrapper = container.querySelector("section > div");
    expect(wrapper).toHaveClass("mx-auto", "w-full", "max-w-190", "2xl:max-w-5xl");
    expect(wrapper).toContainElement(screen.getByRole("heading", { name: "Solicita tu acceso a la comunidad" }));
  });

  it("muestra el encabezado con el enlace a /login sobre el formulario, fuera de la barra de pasos", () => {
    const { container } = render(<RequestAccessView />);

    const header = container.querySelector("header");
    expect(header).not.toBeNull();
    expect(header).toContainElement(screen.getByRole("link", { name: "Iniciar sesión" }));
    expect(container.querySelector("aside")).not.toContainElement(header as HTMLElement);
    const section = container.querySelector("section") as HTMLElement;
    expect((header as HTMLElement).compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("muestra el paso 1 por defecto, sin el paso 2", () => {
    render(<RequestAccessView />);

    expect(screen.getByRole("button", { name: "Continuar al siguiente paso" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Documento de respaldo" })).toBeNull();
    expect(screen.queryByText("Paso completado")).toBeNull();
  });

  it("tras un guardado válido muestra el paso 2 con el nombre completo y la barra con el paso 1 completado", async () => {
    create.mockResolvedValue({ ok: true, data: { id: "draft-1" } });
    render(<RequestAccessView />);

    await fillAndContinue();

    expect(screen.queryByRole("heading", { name: "Solicita tu acceso a la comunidad" })).toBeNull();
    expect(
      screen.getByText("El nombre del documento debe coincidir con el que escribiste en el paso anterior: Ana María Rojas"),
    ).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Paso completado");
    expect(items[1]).toHaveAttribute("aria-current", "step");
  });

  it("Volver a mis datos regresa al paso 1 con los valores intactos", async () => {
    create.mockResolvedValue({ ok: true, data: { id: "draft-1" } });
    render(<RequestAccessView />);
    await fillAndContinue();

    await userEvent.setup().click(screen.getByRole("button", { name: "Volver a mis datos" }));

    expect(screen.getByRole("heading", { name: "Solicita tu acceso a la comunidad" })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Nombres/)).toHaveValue("Ana María");
    expect(screen.getByLabelText(/^Correo electrónico/)).toHaveValue("ana@umss.edu.bo");
    expect(screen.getByRole("combobox", { name: "Carrera" })).toHaveTextContent("Licenciatura en Ingeniería de Sistemas");
    expect(screen.getAllByRole("listitem")[0]).toHaveAttribute("aria-current", "step");
    expect(screen.queryByText("Paso completado")).toBeNull();
  });

  it("el enlace Iniciar sesión abre el diálogo de salida también en el paso 2 si hay datos", async () => {
    create.mockResolvedValue({ ok: true, data: { id: "draft-1" } });
    render(<RequestAccessView />);
    await fillAndContinue();

    await userEvent.setup().click(screen.getByRole("link", { name: "Iniciar sesión" }));

    expect(await screen.findByRole("alertdialog")).toHaveTextContent("¿Salir del formulario?");
  });

  async function reachReview() {
    create.mockResolvedValue({ ok: true, data: { id: "draft-1" } });
    vi.mocked(accessRequestService.uploadDocument).mockResolvedValue({
      ok: true,
      data: { id: "draft-1", documentFileId: "file-1", documentType: "national_title" },
    });
    vi.mocked(accessRequestService.submitAccessRequest).mockResolvedValue({
      ok: true,
      data: { id: "draft-1", requestCode: "SOL-2026-0001", status: "pending", submittedAt: "2026-10-05T23:59:34.644Z" },
    });
    vi.mocked(accessRequestService.getRequestStatus).mockResolvedValue({
      ok: false,
      status: 0,
      fieldErrors: {},
      message: "sin red",
    });
    render(<RequestAccessView />);
    await fillAndContinue();
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox", { name: /Tipo de documento/ }));
    await user.click(await screen.findByRole("option", { name: "Título en provisión nacional" }));
    await user.upload(screen.getByLabelText("Archivo del documento"), new File(["%PDF-1.4"], "titulo.pdf", { type: "application/pdf" }));
    await user.click(await screen.findByRole("button", { name: "Enviar solicitud" }));
    await screen.findByRole("heading", { name: "Revisión de la carrera" });
  }

  it("enviar la solicitud desde el paso 2 lleva a la pantalla con el código y el correo", async () => {
    await reachReview();

    expect(screen.getByText("SOL-2026-0001")).toBeInTheDocument();
    expect(screen.getByText(/Te avisaremos a ana@umss\.edu\.bo/)).toBeInTheDocument();
    expect(accessRequestService.submitAccessRequest).toHaveBeenCalledWith("draft-1");
    expect(screen.queryByRole("heading", { name: "Documento de respaldo" })).toBeNull();
  });

  it("en el paso 3 la barra marca los pasos 1 y 2 completados, el 3 activo y el 4 sin cambios", async () => {
    await reachReview();

    const items = within(screen.getByRole("navigation", { name: "Pasos de la solicitud" })).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Paso completado");
    expect(items[1]).toHaveTextContent("Paso completado");
    expect(items[2]).toHaveAttribute("aria-current", "step");
    expect(items[3]).not.toHaveAttribute("aria-current");
    expect(items[3]).not.toHaveTextContent("Paso completado");
  });

  it("el paso 3 no ofrece volver y el enlace Iniciar sesión navega sin diálogo", async () => {
    await reachReview();

    expect(screen.queryByRole("button", { name: /Volver/ })).toBeNull();
    await userEvent.setup().click(screen.getByRole("link", { name: "Iniciar sesión" }));

    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("el paso 3 no contiene el término egresado", async () => {
    await reachReview();

    expect(document.body.textContent?.toLowerCase()).not.toContain("egres");
  });
});
