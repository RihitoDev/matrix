import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSkillsCatalog } from "../hooks/use-skills-catalog";
import { DOCKER, EMPTY_CONDITIONS, KUBERNETES, PYTHON } from "../testing/vacancy-fixtures";
import { RequirementsStep } from "./requirements-step";

vi.mock("../hooks/use-skills-catalog", () => ({ useSkillsCatalog: vi.fn() }));

const catalogReady = (skills = [PYTHON, DOCKER, KUBERNETES]) => ({ skills, status: "ready" as const, reload: vi.fn() });

function renderStep(overrides: Partial<React.ComponentProps<typeof RequirementsStep>> = {}) {
  const props = {
    conditions: EMPTY_CONDITIONS,
    errors: {},
    updateField: vi.fn(),
    onPrevious: vi.fn(),
    onContinue: vi.fn(),
    ...overrides,
  };
  render(<RequirementsStep {...props} />);
  return props;
}

describe("RequirementsStep", () => {
  beforeEach(() => {
    vi.mocked(useSkillsCatalog).mockReturnValue(catalogReady());
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("muestra el catálogo de habilidades que devuelve el backend", () => {
    renderStep();

    expect(screen.getByRole("button", { name: "Python" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Docker" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kubernetes" })).toBeInTheDocument();
  });

  it("guarda la habilidad elegida con su id y su nombre", () => {
    const { updateField } = renderStep();

    fireEvent.click(screen.getByRole("button", { name: "Python" }));

    expect(updateField).toHaveBeenCalledWith("skills", [PYTHON]);
  });

  it("al volver a hacer clic en una habilidad seleccionada la quita", () => {
    const { updateField } = renderStep({ conditions: { ...EMPTY_CONDITIONS, skills: [PYTHON, DOCKER] } });

    expect(screen.getByRole("button", { name: "Python" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Python" }));

    expect(updateField).toHaveBeenCalledWith("skills", [DOCKER]);
  });

  it("no deja elegir más de 10 habilidades", () => {
    const catalog = Array.from({ length: 11 }, (_, index) => ({ id: `id-${index}`, name: `Tech ${index}` }));
    vi.mocked(useSkillsCatalog).mockReturnValue(catalogReady(catalog));
    const { updateField } = renderStep({ conditions: { ...EMPTY_CONDITIONS, skills: catalog.slice(0, 10) } });

    expect(screen.getByRole("button", { name: "Tech 10" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "+ Añadir habilidad" })).toBeDisabled();
    expect(screen.getByText(/máximo de 10 habilidades/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tech 10" }));
    expect(updateField).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Tech 0" })).toBeEnabled();
  });

  it("actualiza la descripción y respeta el tope de 3000 caracteres", () => {
    const updateField = vi.fn();
    renderStep({ updateField });
    const textarea = screen.getByLabelText(/Descripcion del puesto/);

    fireEvent.change(textarea, { target: { value: "Línea 1\n- Línea 2" } });
    expect(updateField).toHaveBeenCalledWith("description", "Línea 1\n- Línea 2");

    updateField.mockClear();
    fireEvent.change(textarea, { target: { value: "a".repeat(3001) } });
    expect(updateField).not.toHaveBeenCalled();
  });

  it("muestra el contador de caracteres", () => {
    renderStep({ conditions: { ...EMPTY_CONDITIONS, description: "Hola" } });

    expect(screen.getByText("4/3000")).toBeInTheDocument();
  });

  it("muestra los errores de la descripción y de las habilidades", () => {
    renderStep({ errors: { description: "Este campo es obligatorio", skills: "Debes seleccionar al menos una habilidad requerida" } });

    expect(screen.getByText("Este campo es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("Debes seleccionar al menos una habilidad requerida")).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripcion del puesto/)).toHaveAttribute("aria-invalid", "true");
  });

  it("informa que se está cargando el catálogo", () => {
    vi.mocked(useSkillsCatalog).mockReturnValue({ skills: [], status: "loading", reload: vi.fn() });
    renderStep();

    expect(screen.getByText("Cargando habilidades...")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Python" })).not.toBeInTheDocument();
  });

  it("permite reintentar si el catálogo no se pudo cargar", () => {
    const reload = vi.fn();
    vi.mocked(useSkillsCatalog).mockReturnValue({ skills: [], status: "error", reload });
    renderStep();

    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo cargar el catálogo de habilidades.");
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(reload).toHaveBeenCalledOnce();
  });

  it("navega con Anterior y Continuar", () => {
    const { onPrevious, onContinue } = renderStep();

    fireEvent.click(screen.getByRole("button", { name: "Anterior" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(onPrevious).toHaveBeenCalledOnce();
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("advierte antes de recargar si hay descripción o habilidades", () => {
    renderStep({ conditions: { ...EMPTY_CONDITIONS, skills: [PYTHON] } });
    const event = new Event("beforeunload", { cancelable: true });

    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });
});
