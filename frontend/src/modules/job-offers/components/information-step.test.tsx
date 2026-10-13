import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EMPTY_CONDITIONS } from "../testing/vacancy-fixtures";
import { InformationStep } from "./information-step";

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }: { children: React.ReactNode; onValueChange?: (value: string | null) => void }) => (
    <div>
      <button type="button" onClick={() => onValueChange?.("Medio tiempo")}>elegir-contrato</button>
      <button type="button" onClick={() => onValueChange?.(null)}>limpiar-contrato</button>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, id }: { children: React.ReactNode; id?: string }) => <div id={id}>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

function renderStep(overrides: Partial<React.ComponentProps<typeof InformationStep>> = {}) {
  const props = {
    conditions: EMPTY_CONDITIONS,
    errors: {},
    updateField: vi.fn(),
    selectModality: vi.fn(),
    validateField: vi.fn(),
    onCancel: vi.fn(),
    onContinue: vi.fn(),
    ...overrides,
  };
  render(<InformationStep {...props} />);
  return props;
}

const input = (label: RegExp) => screen.getByLabelText(label) as HTMLInputElement;

describe("InformationStep", () => {
  afterEach(() => {
    cleanup();
  });

  it("muestra los 8 campos del formulario, con salario obligatorio", () => {
    renderStep();

    ["Titulo del puesto", "Enlace de Google Maps", "Categoria", "Numero de vacantes", "Salario", "Idiomas"].forEach((label) =>
      expect(input(new RegExp(label))).toBeInTheDocument(),
    );
    ["Presencial", "Remoto", "Híbrido"].forEach((name) =>
      expect(screen.getByRole("button", { name })).toBeInTheDocument(),
    );
    expect(screen.getByText(/Salario/).querySelector("span")).toHaveTextContent("*");
  });

  it("muestra el mensaje de error debajo de cada campo inválido", () => {
    renderStep({ errors: { title: "Este campo es obligatorio", salary: "El salario debe ser mayor a 0", modality: "Este campo es obligatorio" } });

    expect(screen.getAllByText("Este campo es obligatorio")).toHaveLength(2);
    expect(screen.getByText("El salario debe ser mayor a 0")).toBeInTheDocument();
    expect(input(/Titulo del puesto/)).toHaveAttribute("aria-invalid", "true");
    expect(input(/Salario/)).toHaveAttribute("aria-describedby", "salary-error");
  });

  it("bloquea en tiempo real los caracteres no permitidos del título", () => {
    renderStep();
    const title = input(/Titulo del puesto/);

    expect(fireEvent.keyDown(title, { key: "@" })).toBe(false);
    expect(fireEvent.keyDown(title, { key: "a" })).toBe(true);
    expect(fireEvent.keyDown(title, { key: "Backspace" })).toBe(true);
    expect(fireEvent.keyDown(title, { key: "v", ctrlKey: true })).toBe(true);
    expect(title).toHaveAttribute("maxlength", "60");
  });

  it("limpia los símbolos y recorta a 60 caracteres el texto pegado en el título", () => {
    const updateField = vi.fn();
    renderStep({ updateField });

    fireEvent.change(input(/Titulo del puesto/), { target: { value: `Dev@ #Ops$ ${"x".repeat(80)}` } });

    const [, value] = updateField.mock.calls[0];
    expect(value).toMatch(/^Dev Ops x+$/);
    expect(value).toHaveLength(60);
  });

  it("bloquea el título al llegar a 60 caracteres", () => {
    renderStep({ conditions: { ...EMPTY_CONDITIONS, title: "a".repeat(60) } });

    expect(fireEvent.keyDown(input(/Titulo del puesto/), { key: "b" })).toBe(false);
  });

  it("solo admite dígitos en el número de vacantes y limita el valor a 500", () => {
    const { updateField } = renderStep();
    const count = input(/Numero de vacantes/);

    expect(fireEvent.keyDown(count, { key: "a" })).toBe(false);
    expect(fireEvent.keyDown(count, { key: "7" })).toBe(true);

    fireEvent.change(count, { target: { value: "25" } });
    expect(updateField).toHaveBeenLastCalledWith("vacancyCount", "25");

    fireEvent.change(count, { target: { value: "9000" } });
    expect(updateField).toHaveBeenLastCalledWith("vacancyCount", "500");

    fireEvent.change(count, { target: { value: "1a2" } });
    expect(updateField).toHaveBeenLastCalledWith("vacancyCount", "12");
  });

  it("permite borrar el número de vacantes", () => {
    const { updateField } = renderStep({ conditions: { ...EMPTY_CONDITIONS, vacancyCount: "5" } });

    fireEvent.change(input(/Numero de vacantes/), { target: { value: "" } });

    expect(updateField).toHaveBeenCalledWith("vacancyCount", "");
  });

  it("aplica la máscara del salario mientras se escribe", () => {
    const { updateField } = renderStep();
    const salary = input(/Salario/);

    fireEvent.change(salary, { target: { value: "6500-8000" } });
    expect(updateField).toHaveBeenLastCalledWith("salary", "Bs 6.500 - 8.000");

    fireEvent.change(salary, { target: { value: "6500-" } });
    expect(updateField).toHaveBeenLastCalledWith("salary", "Bs 6.500 - ");

    fireEvent.change(salary, { target: { value: "5000" } });
    expect(updateField).toHaveBeenLastCalledWith("salary", "Bs 5.000");

    fireEvent.change(salary, { target: { value: "@#$" } });
    expect(updateField).toHaveBeenLastCalledWith("salary", "");
  });

  it("valida el salario y el enlace de Maps al perder el foco", () => {
    const { validateField } = renderStep();

    fireEvent.blur(input(/Salario/));
    expect(validateField).toHaveBeenCalledWith("salary");

    fireEvent.blur(input(/Enlace de Google Maps/));
    expect(validateField).toHaveBeenCalledWith("mapsLink");
  });

  it("permite elegir una modalidad y la marca como seleccionada", () => {
    const { selectModality } = renderStep({ conditions: { ...EMPTY_CONDITIONS, modality: "Remoto" } });

    expect(screen.getByRole("button", { name: "Remoto" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Híbrido" }));

    expect(selectModality).toHaveBeenCalledWith("Híbrido");
  });

  it("no deja la modalidad vacía al volver a pulsar la seleccionada", () => {
    const { selectModality } = renderStep({ conditions: { ...EMPTY_CONDITIONS, modality: "Remoto" } });

    fireEvent.click(screen.getByRole("button", { name: "Remoto" }));

    expect(selectModality).not.toHaveBeenCalled();
  });

  it("guarda el tipo de contrato elegido", () => {
    const { updateField } = renderStep();

    fireEvent.click(screen.getByRole("button", { name: "elegir-contrato" }));
    expect(updateField).toHaveBeenLastCalledWith("contractType", "Medio tiempo");

    fireEvent.click(screen.getByRole("button", { name: "limpiar-contrato" }));
    expect(updateField).toHaveBeenLastCalledWith("contractType", "");
  });

  it("envía los textos libres al estado del wizard", () => {
    const { updateField } = renderStep();

    fireEvent.change(input(/Categoria/), { target: { value: "Tecnología" } });
    fireEvent.change(input(/Idiomas/), { target: { value: "Español" } });
    fireEvent.change(input(/Enlace de Google Maps/), { target: { value: "https://maps.app.goo.gl/a" } });

    expect(updateField).toHaveBeenCalledWith("category", "Tecnología");
    expect(updateField).toHaveBeenCalledWith("languages", "Español");
    expect(updateField).toHaveBeenCalledWith("mapsLink", "https://maps.app.goo.gl/a");
    expect(input(/Idiomas/)).toHaveAttribute("maxlength", "100");
  });

  it("delega Cancelar y Continuar", () => {
    const { onCancel, onContinue } = renderStep();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onContinue).toHaveBeenCalledOnce();
  });
});
