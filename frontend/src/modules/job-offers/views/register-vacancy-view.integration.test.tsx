import { AxiosError, type AxiosResponse } from "axios";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/services/api-client";
import { clearAccessToken, saveAccessToken } from "@/shared/services/storage/access-token-storage";
import { renderWithQuery } from "@/shared/testing/render-with-query";
import { buildSessionToken, COMPANY_ID, DOCKER, KUBERNETES, PYTHON } from "../testing/vacancy-fixtures";
import { RegisterVacancyView } from "./register-vacancy-view";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/shared/services/api-client", () => ({ apiClient: { get: vi.fn(), post: vi.fn() } }));
vi.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }: { children: React.ReactNode; onValueChange?: (value: string) => void }) => (
    <div data-testid="select" onClick={() => onValueChange?.("Tiempo completo")}>{children}</div>
  ),
  SelectTrigger: ({ children, id }: { children: React.ReactNode; id?: string }) => <div id={id}>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const EXPECTED_PAYLOAD = {
  title: "DevOps Senior",
  description: "Buscamos un DevOps con Docker y Kubernetes.",
  modality: "Híbrido",
  contractType: "Tiempo completo",
  category: "Tecnología",
  positionsAvailable: 2,
  salaryMin: 6500,
  salaryMax: 8000,
  languages: "Español, inglés intermedio",
  locationUrl: "https://maps.app.goo.gl/TechBolivia",
  skillIds: [DOCKER.id, KUBERNETES.id],
};

const CREATED = { data: { statusCode: 201, ok: true, detail: "", data: { id: "offer-1", createdAt: "2026-10-12T00:00:00.000Z" } } };

const byId = (id: string) => document.getElementById(id) as HTMLInputElement;
const type = (id: string, value: string) => fireEvent.change(byId(id), { target: { value } });
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole("button", { name }));

function responseError(status: number, data: unknown) {
  return new AxiosError("fail", "ERR_BAD_REQUEST", undefined, undefined, { status, data } as AxiosResponse);
}

function fillInformation() {
  type("title", "DevOps Senior");
  click("Híbrido");
  type("mapsLink", EXPECTED_PAYLOAD.locationUrl);
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
  click("+ Añadir habilidad");
  fireEvent.change(screen.getByLabelText(/Buscar tecnología/), { target: { value: "kuber" } });
  click("Kubernetes");
  click("Añadir habilidad");
  await waitFor(() => expect(screen.queryByText("Buscar habilidad")).not.toBeInTheDocument());
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
    window.history.pushState({}, "", "/vacancies/register");
    vi.stubEnv("NEXT_PUBLIC_DEMO_COMPANY_ID", COMPANY_ID);
    saveAccessToken(buildSessionToken("empresa"));
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { statusCode: 200, ok: true, detail: "", data: [PYTHON, DOCKER, KUBERNETES] },
    });
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    clearAccessToken();
  });

  it("publica la vacante con el contrato exacto y luego limpia el formulario", async () => {
    vi.mocked(apiClient.post).mockResolvedValue(CREATED);
    renderWithQuery(<RegisterVacancyView />);

    await goToPreview();
    expect(screen.getByText("Bs 6.500 - 8.000")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Habilidades requeridas" })).toHaveTextContent("DockerKubernetes");
    click("Confirmar publicación");

    expect(await screen.findByText("Vacante publicada")).toBeInTheDocument();
    expect(apiClient.get).toHaveBeenCalledWith("/job-offers/skills");
    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(apiClient.post).toHaveBeenCalledWith(`/companies/${COMPANY_ID}/job-offers`, EXPECTED_PAYLOAD);

    click("Aceptar");
    await waitFor(() => expect(byId("title")).toBeInTheDocument());
    expect(byId("title").value).toBe("");
  });

  it("conserva las tecnologías elegidas al ir y volver", async () => {
    renderWithQuery(<RegisterVacancyView />);
    await goToPreview();

    click("Anterior");
    await screen.findByRole("button", { name: "Docker" });

    expect(screen.getByRole("button", { name: "Docker" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Kubernetes" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Python" })).toHaveAttribute("aria-pressed", "false");
    expect(byId("description").value).toBe("Buscamos un DevOps con Docker y Kubernetes.");
  });

  it("sin conexión: muestra la alerta, conserva los datos y permite reintentar", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce(new AxiosError("Network Error", "ERR_NETWORK")).mockResolvedValueOnce(CREATED);
    renderWithQuery(<RegisterVacancyView />);
    await goToPreview();

    click("Confirmar publicación");

    expect(await screen.findByRole("alert")).toHaveTextContent("Sin conexión a internet");
    expect(screen.getByText("DevOps Senior")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Confirmar publicación" })).toBeEnabled());

    click("Confirmar publicación");
    expect(await screen.findByText("Vacante publicada")).toBeInTheDocument();
    expect(apiClient.post).toHaveBeenCalledTimes(2);
  });

  it("error de validación del backend: muestra los motivos sin nombres técnicos", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(
      responseError(400, {
        data: [{ field: "locationUrl", message: "Ingresa un enlace valido de Google Maps" }],
        detail: "locationUrl: Ingresa un enlace valido de Google Maps",
      }),
    );
    renderWithQuery(<RegisterVacancyView />);
    await goToPreview();

    click("Confirmar publicación");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Algunos datos de la vacante no son válidos");
    expect(alert).toHaveTextContent("Ingresa un enlace valido de Google Maps");
    expect(alert).not.toHaveTextContent("locationUrl");
  });

  it("error del servidor: muestra el mensaje amigable", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(responseError(500, {}));
    renderWithQuery(<RegisterVacancyView />);
    await goToPreview();

    click("Confirmar publicación");

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo completar la publicación. Inténtalo más tarde.");
  });

  it("no llama al backend si la sesión no es de empresa", async () => {
    saveAccessToken(buildSessionToken("titulado"));
    renderWithQuery(<RegisterVacancyView />);
    await goToPreview();

    click("Confirmar publicación");

    expect(await screen.findByRole("alert")).toHaveTextContent("No hay una empresa asociada");
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it("paso 1: con campos vacíos no avanza y marca los obligatorios", () => {
    renderWithQuery(<RegisterVacancyView />);

    click("Continuar");

    expect(screen.getAllByText("Este campo es obligatorio")).toHaveLength(8);
    expect(screen.queryByText("Requisitos técnicos")).not.toBeInTheDocument();
  });

  it("paso 2: exige descripción y al menos una tecnología", async () => {
    renderWithQuery(<RegisterVacancyView />);
    fillInformation();
    await screen.findByRole("button", { name: "Docker" });

    click("Continuar");

    expect(screen.getByText("Este campo es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("Debes seleccionar al menos una habilidad requerida")).toBeInTheDocument();
    expect(screen.queryByText("VISTA PREVIA DE LA PUBLICACIÓN")).not.toBeInTheDocument();
  });

  it("Cancelar con datos pide confirmación y deja el formulario vacío", async () => {
    renderWithQuery(<RegisterVacancyView />);
    type("title", "DevOps");

    click("Cancelar");
    click("Descartar");

    await waitFor(() => expect(byId("title").value).toBe(""));
  });

  it("salir por un enlace del menú con datos pide confirmación antes de navegar", async () => {
    renderWithQuery(<RegisterVacancyView />);
    const link = document.createElement("a");
    link.href = "/profile";
    link.textContent = "Mi perfil";
    document.body.appendChild(link);
    type("title", "DevOps");

    fireEvent.click(link);
    expect(await screen.findByText("¿Salir sin publicar?")).toBeInTheDocument();
    click("Salir");

    expect(push).toHaveBeenCalledWith("/profile");
  });
});
