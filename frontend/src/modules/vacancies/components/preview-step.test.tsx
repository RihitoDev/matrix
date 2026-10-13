import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildLongDescription, DOCKER, VALID_CONDITIONS } from "../testing/vacancy-fixtures";
import { PreviewStep } from "./preview-step";

const COMPANY = { id: "company-id", name: "TechBolivia S.R.L.", initials: "TB" };

function renderStep(overrides: Partial<React.ComponentProps<typeof PreviewStep>> = {}) {
  const props = {
    conditions: VALID_CONDITIONS,
    company: COMPANY,
    isSubmitting: false,
    isPublished: false,
    error: null,
    onPrevious: vi.fn(),
    onConfirm: vi.fn(),
    onFinish: vi.fn(),
    ...overrides,
  };
  render(<PreviewStep {...props} />);
  return props;
}

describe("PreviewStep", () => {
  afterEach(() => {
    cleanup();
  });

  it("muestra la tarjeta con los datos reales ingresados en los pasos 1 y 2", () => {
    renderStep();

    expect(screen.getByText("TechBolivia S.R.L.")).toBeInTheDocument();
    expect(screen.getByText("TB")).toBeInTheDocument();
    expect(screen.getByText("DevOps Senior")).toBeInTheDocument();
    expect(screen.getByText("Tecnología")).toBeInTheDocument();
    expect(screen.getByText("Híbrido")).toBeInTheDocument();
    expect(screen.getByText("Tiempo completo")).toBeInTheDocument();
    expect(screen.getByText("2 vacantes")).toBeInTheDocument();
    expect(screen.getByText("Bs 6.500 - 8.000")).toBeInTheDocument();
    expect(screen.getByText("Español, inglés intermedio")).toBeInTheDocument();
    expect(screen.getByText(/Buscamos un perfil DevOps/)).toBeInTheDocument();
  });

  it("muestra solo las habilidades elegidas, sin datos de ejemplo", () => {
    renderStep();

    const chips = screen.getByRole("list", { name: "Habilidades requeridas" });
    expect(chips).toHaveTextContent("Docker");
    expect(chips).toHaveTextContent("Kubernetes");
    expect(screen.queryByText("Python")).not.toBeInTheDocument();
  });

  it("usa el singular cuando hay una sola vacante", () => {
    renderStep({ conditions: { ...VALID_CONDITIONS, vacancyCount: "1" } });

    expect(screen.getByText("1 vacante")).toBeInTheDocument();
  });

  it("abre el enlace de Maps en una pestaña nueva", () => {
    renderStep();

    const link = screen.getByRole("link", { name: VALID_CONDITIONS.mapsLink });
    expect(link).toHaveAttribute("href", VALID_CONDITIONS.mapsLink);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("recorta la descripción larga y permite expandirla y contraerla", () => {
    const description = `${buildLongDescription(200)}FINAL`;
    renderStep({ conditions: { ...VALID_CONDITIONS, description } });

    expect(screen.queryByText(/FINAL/)).not.toBeInTheDocument();
    expect(screen.getByText(/\.\.\./)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ver más" }));
    expect(screen.getByText(/FINAL/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ver menos" }));
    expect(screen.queryByText(/FINAL/)).not.toBeInTheDocument();
  });

  it("no muestra Ver más si la descripción es corta", () => {
    renderStep();

    expect(screen.queryByRole("button", { name: "Ver más" })).not.toBeInTheDocument();
  });

  it("confirma la publicación y vuelve al paso anterior desde los botones", () => {
    const { onConfirm, onPrevious } = renderStep();

    fireEvent.click(screen.getByRole("button", { name: "Confirmar publicación" }));
    fireEvent.click(screen.getByRole("button", { name: "Anterior" }));

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onPrevious).toHaveBeenCalledOnce();
  });

  it("deshabilita los botones y muestra carga mientras publica", () => {
    renderStep({ isSubmitting: true });

    const confirm = screen.getByRole("button", { name: "Publicando..." });
    expect(confirm).toBeDisabled();
    expect(confirm).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
  });

  it("muestra el error con sus detalles y deja el botón habilitado para reintentar", () => {
    renderStep({
      error: { kind: "validation", message: "Algunos datos no son válidos.", details: ["Este campo es obligatorio"] },
    });

    expect(screen.getByRole("alert")).toHaveTextContent("Algunos datos no son válidos.");
    expect(screen.getByRole("alert")).toHaveTextContent("Este campo es obligatorio");
    expect(screen.getByRole("button", { name: "Confirmar publicación" })).toBeEnabled();
  });

  it("muestra el mensaje de éxito y reinicia el formulario al aceptar", () => {
    const { onFinish } = renderStep({ isPublished: true });

    expect(screen.getByText("Vacante publicada")).toBeInTheDocument();
    expect(screen.getByText("Tu vacante se publicó correctamente.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));

    expect(onFinish).toHaveBeenCalledOnce();
  });

  it("advierte antes de recargar hasta que la vacante se publica", () => {
    renderStep();
    const beforePublish = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(beforePublish);
    expect(beforePublish.defaultPrevented).toBe(true);

    cleanup();
    renderStep({ isPublished: true });
    const afterPublish = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(afterPublish);
    expect(afterPublish.defaultPrevented).toBe(false);
  });

  it("muestra un nombre de habilidad por cada elemento seleccionado", () => {
    renderStep({ conditions: { ...VALID_CONDITIONS, skills: [DOCKER] } });

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });
});
