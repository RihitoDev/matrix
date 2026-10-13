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

  it("muestra el catálogo de tecnologías y el botón para buscar", () => {
    renderStep();

    ["Python", "Docker", "Kubernetes", "+ Añadir habilidad"].forEach((name) =>
      expect(screen.getByRole("button", { name })).toBeInTheDocument(),
    );
  });

  it("selecciona una tecnología con un clic", () => {
    const { updateField } = renderStep();

    fireEvent.click(screen.getByRole("button", { name: "Python" }));

    expect(updateField).toHaveBeenCalledWith("skills", [PYTHON]);
  });

  it("deselecciona una tecnología al volver a hacer clic", () => {
    const { updateField } = renderStep({ conditions: { ...EMPTY_CONDITIONS, skills: [PYTHON, DOCKER] } });

    expect(screen.getByRole("button", { name: "Python" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Python" }));

    expect(updateField).toHaveBeenCalledWith("skills", [DOCKER]);
  });

  it("agrega la tecnología elegida en el pop up sin duplicarla", () => {
    const { updateField } = renderStep({ conditions: { ...EMPTY_CONDITIONS, skills: [DOCKER] } });

    fireEvent.click(screen.getByRole("button", { name: "+ Añadir habilidad" }));
    fireEvent.change(screen.getByLabelText(/Buscar tecnología/), { target: { value: "pyth" } });
    fireEvent.click(screen.getByRole("button", { name: "Python" }));
    fireEvent.click(screen.getByRole("button", { name: "Añadir habilidad" }));

    expect(updateField).toHaveBeenCalledWith("skills", [DOCKER, PYTHON]);
  });

  it("no deja elegir más de 10 tecnologías", () => {
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

  it("actualiza la descripción conservando saltos de línea y respetando el tope", () => {
    const { updateField } = renderStep();
    const textarea = screen.getByLabelText(/Descripcion del puesto/);

    fireEvent.change(textarea, { target: { value: "Línea 1\n- Línea 2" } });
    expect(updateField).toHaveBeenLastCalledWith("description", "Línea 1\n- Línea 2");

    fireEvent.change(textarea, { target: { value: "a".repeat(3005) } });
    expect(updateField).toHaveBeenLastCalledWith("description", "a".repeat(3000));
    expect(textarea).toHaveAttribute("maxlength", "3000");
  });

  it("muestra el contador de caracteres y lo resalta al llegar al tope", () => {
    renderStep({ conditions: { ...EMPTY_CONDITIONS, description: "Hola" } });
    expect(screen.getByText("4/3000")).toBeInTheDocument();

    cleanup();
    renderStep({ conditions: { ...EMPTY_CONDITIONS, description: "a".repeat(3000) } });
    expect(screen.getByText("3000/3000")).toHaveClass("text-danger");
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
});
