import { AxiosError, type AxiosResponse } from "axios";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/services/api-client";
import { COMPANY_ID, DOCKER, KUBERNETES, PYTHON } from "../testing/vacancy-fixtures";
import { RegisterVacancyView } from "./register-vacancy-view";

vi.mock("@/shared/services/api-client", () => ({ apiClient: { get: vi.fn(), post: vi.fn() } }));
vi.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }: { children: React.ReactNode; onValueChange?: (value: string) => void }) => (
    <div data-testid="select" onClick={() => onValueChange?.("Tiempo completo")}>{children}</div>
  ),
  SelectTrigger: ({ children, id }: { children: React.ReactNode; id?: string }) => <button id={id} type="button">{children}</button>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const EXPECTED_PAYLOAD = {
  tituloPuesto: "DevOps Senior",
  descripcion: "Buscamos un DevOps con Docker y Kubernetes.",
  modalidad: "Híbrido",
  tipoContrato: "Tiempo completo",
  categoria: "Tecnología",
  numeroVacantes: 2,
  salarioMin: 6500,
  salarioMax: 8000,
  idiomas: "Español, inglés intermedio",
  enlaceGoogleMaps: "https://maps.google.com/?q=Av.+Ballivian+742+Cochabamba",
  tecnologias: [DOCKER.id, KUBERNETES.id],
};

const byId = (id: string) => document.getElementById(id) as HTMLInputElement;
const type = (id: string, value: string) => fireEvent.change(byId(id), { target: { value } });
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole("button", { name }));

function networkError() {
  return new AxiosError("Network Error", "ERR_NETWORK");
}

function responseError(status: number, data: unknown) {
  return new AxiosError("fail", "ERR_BAD_REQUEST", undefined, undefined, { status, data } as AxiosResponse);
}

function fillInformation() {
  type("title", "DevOps Senior");
  click("Híbrido");
  type("mapsLink", EXPECTED_PAYLOAD.enlaceGoogleMaps);
  fireEvent.click(screen.getByTestId("select"));
  type("category", "Tecnología");
  type("vacancyCount", "2");
  type("salary", "6500-8000");
  type("languages", "Español, inglés intermedio");
  click("Continuar");
}

async function fillRequirements() {
  await screen.findByRole("button", { name: "Docker" });
  type("description", "Buscamos un DevOps con Docker y Kubernetes.");
  click("Docker");
  click("Kubernetes");
  click("Continuar");
}

async function goToPreview() {
  fillInformation();
  await fillRequirements();
  await screen.findByText("VISTA PREVIA DE LA PUBLICACIÓN");
}

describe("Registrar vacante: wizard completo conectado al backend", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    vi.stubEnv("NEXT_PUBLIC_DEMO_COMPANY_ID", COMPANY_ID);
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        statusCode: 200,
        ok: true,
        detail: "",
        data: [PYTHON, DOCKER, KUBERNETES].map((skill) => ({ ...skill, isCustom: false })),
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("publica la vacante: envía al backend el contrato exacto y luego limpia el formulario", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { statusCode: 201, ok: true, detail: "", data: { id: "offer-1", fechaCreacion: "2026-10-10", mensaje: "Oferta publicada correctamente" } },
    });
    render(<RegisterVacancyView />);

    await goToPreview();
    expect(screen.getByText("DevOps Senior")).toBeInTheDocument();
    expect(screen.getByText("Bs 6.500 - 8.000")).toBeInTheDocument();
    expect(screen.getByText("Kubernetes")).toBeInTheDocument();
    click("Confirmar publicación");

    expect(await screen.findByText("Vacante publicada")).toBeInTheDocument();
    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(apiClient.post).toHaveBeenCalledWith(`/v1/empresas/${COMPANY_ID}/ofertas`, EXPECTED_PAYLOAD);

    click("Aceptar");
    await waitFor(() => expect(byId("title")).toBeInTheDocument());
    expect(byId("title").value).toBe("");
  });

  it("carga las habilidades desde el backend y conserva las elegidas al ir y volver", async () => {
    render(<RegisterVacancyView />);
    fillInformation();
    await fillRequirements();
    await screen.findByText("VISTA PREVIA DE LA PUBLICACIÓN");

    click("Anterior");
    await screen.findByRole("button", { name: "Docker" });

    expect(apiClient.get).toHaveBeenCalledWith("/skills", expect.anything());
    expect(screen.getByRole("button", { name: "Docker" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Python" })).toHaveAttribute("aria-pressed", "false");
    expect(byId("description").value).toBe("Buscamos un DevOps con Docker y Kubernetes.");
  });

  it("sin conexión: muestra la alerta, conserva los datos y permite reintentar", async () => {
    vi.mocked(apiClient.post)
      .mockRejectedValueOnce(networkError())
      .mockResolvedValueOnce({ data: { statusCode: 201, ok: true, detail: "", data: { id: "offer-1", fechaCreacion: "", mensaje: "" } } });
    render(<RegisterVacancyView />);
    await goToPreview();

    click("Confirmar publicación");

    expect(await screen.findByRole("alert")).toHaveTextContent("Sin conexión a internet");
    expect(screen.getByText("DevOps Senior")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar publicación" })).toBeEnabled();

    click("Confirmar publicación");
    expect(await screen.findByText("Vacante publicada")).toBeInTheDocument();
    expect(apiClient.post).toHaveBeenCalledTimes(2);
  });

  it("error de validación del backend (422): muestra los motivos", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(
      responseError(422, { detail: [{ campo: "enlaceGoogleMaps", mensaje: "Ingresa un enlace valido de Google Maps" }] }),
    );
    render(<RegisterVacancyView />);
    await goToPreview();

    click("Confirmar publicación");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Algunos datos de la vacante no son válidos");
    expect(alert).toHaveTextContent("Ingresa un enlace valido de Google Maps");
  });

  it("error del servidor (500): muestra el mensaje amigable", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(responseError(500, {}));
    render(<RegisterVacancyView />);
    await goToPreview();

    click("Confirmar publicación");

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo completar la publicación. Inténtalo más tarde.");
  });

  it("no llama al backend si no hay empresa asociada a la sesión", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_COMPANY_ID", "");
    render(<RegisterVacancyView />);
    await goToPreview();

    click("Confirmar publicación");

    expect(await screen.findByRole("alert")).toHaveTextContent("No hay una empresa asociada");
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it("paso 1: con campos vacíos no avanza y marca los obligatorios", () => {
    render(<RegisterVacancyView />);

    click("Continuar");

    expect(screen.getAllByText("Este campo es obligatorio")).toHaveLength(8);
    expect(screen.queryByText("Requisitos técnicos")).not.toBeInTheDocument();
  });

  it("paso 2: exige descripción y al menos una habilidad", async () => {
    render(<RegisterVacancyView />);
    fillInformation();
    await screen.findByRole("button", { name: "Docker" });

    click("Continuar");

    expect(screen.getByText("Este campo es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("Debes seleccionar al menos una habilidad requerida")).toBeInTheDocument();
    expect(screen.queryByText("VISTA PREVIA DE LA PUBLICACIÓN")).not.toBeInTheDocument();
  });
});
