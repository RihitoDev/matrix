import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { AccessRequestProvider } from "../../contexts/access-request-context";
import { PersonalDataForm } from "./personal-data-form";

const renderForm = () =>
  render(
    <AccessRequestProvider>
      <PersonalDataForm />
    </AccessRequestProvider>,
  );

describe("PersonalDataForm", () => {
  afterEach(() => cleanup());

  it("muestra todos los campos del paso 1", () => {
    renderForm();

    expect(screen.getByLabelText(/^Nombres/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Apellidos/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Carnet de identidad/)).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Expedido" })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Código SIS/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Correo electrónico/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Fecha de nacimiento/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Año de titulación/)).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Carrera" })).toBeInTheDocument();
  });

  it("muestra el título y el subtítulo del formulario", () => {
    renderForm();

    expect(screen.getByRole("heading", { name: "Solicita tu acceso a la comunidad" })).toBeInTheDocument();
    expect(screen.getByText(/La carrera verifica cada solicitud con tu documento académico/)).toBeInTheDocument();
  });

  it("muestra los textos de ayuda del código SIS y del correo", () => {
    renderForm();

    expect(screen.getByText("Figura en tu carnet universitario o en tu kárdex.")).toBeInTheDocument();
    expect(screen.getByText("Aquí te enviaremos el resultado y el código de activación.")).toBeInTheDocument();
  });

  it("muestra el icono de correo y el placeholder del teléfono", () => {
    const { container } = renderForm();

    expect(container.querySelector("svg.lucide-mail")).not.toBeNull();
    expect(screen.getByPlaceholderText("Ej. 70712345")).toBeInTheDocument();
  });

  it("coloca el carnet y el expedido en la misma fila", () => {
    renderForm();

    const row = screen.getByLabelText(/^Carnet de identidad/).closest(".flex.gap-2");
    expect(row).not.toBeNull();
    expect(row).toContainElement(screen.getByRole("combobox", { name: "Expedido" }));
  });

  it("el select de expedido usa la altura de 42 px en lugar de la de shadcn", () => {
    renderForm();

    const trigger = screen.getByRole("combobox", { name: "Expedido" });
    expect(trigger).toHaveClass("data-[size=default]:h-[42px]", "2xl:data-[size=default]:h-12", "focus-visible:border-accent");
    expect(trigger).not.toHaveClass("data-[size=default]:h-8");
  });

  it("alinea el botón a la derecha con el chevron y el fondo tinta", () => {
    const { container } = renderForm();

    const button = screen.getByRole("button", { name: "Continuar al siguiente paso" });
    expect(button).toHaveClass("bg-ink", "text-surface", "2xl:h-12");
    expect(button.querySelector("svg.lucide-chevron-right")).not.toBeNull();
    // El botón principal es el último de la fila (a la derecha) y la fila va dentro del contenedor con el borde superior
    const row = button.parentElement as HTMLElement;
    expect(row).toHaveClass("justify-between");
    expect(row.lastElementChild).toBe(button);
    expect(row.parentElement).toHaveClass("items-end");
    expect(container.querySelector(".border-t")).toBe(row.parentElement);
  });

  it("marca el teléfono como opcional", () => {
    renderForm();

    expect(screen.getByText("(opcional)")).toBeInTheDocument();
  });

  it("usa los tipos de campo adecuados", () => {
    renderForm();

    expect(screen.getByLabelText(/^Correo electrónico/)).toHaveAttribute("type", "email");
    expect(screen.getByLabelText(/^Fecha de nacimiento/)).toHaveAttribute("type", "date");
    expect(screen.getByLabelText(/Teléfono/)).toHaveAttribute("maxlength", "8");
  });

  it("ofrece los 9 códigos de expedición", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("combobox", { name: "Expedido" }));

    const options = await screen.findAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual([
      "CB", "LP", "SC", "OR", "PT", "CH", "TJ", "BE", "PD",
    ]);
  });

  it("reemplaza el año de ingreso por el año de titulación", () => {
    const { container } = renderForm();

    expect(container.textContent).not.toMatch(/ingreso/i);
    expect(screen.getByLabelText(/^Año de titulación/)).toHaveAttribute("maxlength", "4");
  });

  it("ofrece las dos carreras del catálogo", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("combobox", { name: "Carrera" }));

    const options = await screen.findAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual([
      "Licenciatura en Ingeniería de Sistemas",
      "Licenciatura Ingeniería en Informática",
    ]);
  });

  it("muestra la carrera en una fila propia de ancho completo", () => {
    renderForm();

    const trigger = screen.getByRole("combobox", { name: "Carrera" });
    expect(trigger).toHaveClass("w-full", "data-[size=default]:h-[42px]");
    expect(trigger.closest("div.md\\:col-span-2")).not.toBeNull();
  });

  it("escala tipografía y separación desde 2xl sin fijar el ancho del formulario", () => {
    const { container } = renderForm();

    expect(container.firstElementChild?.className).not.toMatch(/max-w-/);
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("text-3xl", "2xl:text-4xl");
    expect(container.querySelector("form")).toHaveClass("2xl:gap-x-8", "2xl:gap-y-6");
    expect(screen.getByText("Carrera")).toHaveClass("2xl:text-base");
  });

  it("muestra la leyenda de campo obligatorio antes del formulario", () => {
    const { container } = renderForm();

    const legend = screen.getByText("Campo obligatorio");
    expect(legend).toHaveTextContent("* Campo obligatorio");
    const form = container.querySelector("form") as HTMLFormElement;
    expect(legend.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("marca con aria-required los nueve campos obligatorios y no el teléfono", () => {
    renderForm();

    const required = [
      screen.getByLabelText(/^Nombres/),
      screen.getByLabelText(/^Apellidos/),
      screen.getByLabelText(/^Carnet de identidad/),
      screen.getByRole("combobox", { name: /Expedido/ }),
      screen.getByLabelText(/^Código SIS/),
      screen.getByLabelText(/^Correo electrónico/),
      screen.getByLabelText(/^Fecha de nacimiento/),
      screen.getByLabelText(/^Año de titulación/),
      screen.getByRole("combobox", { name: /Carrera/ }),
    ];
    for (const control of required) {
      expect(control).toHaveAttribute("aria-required", "true");
    }
    expect(screen.getByLabelText(/Teléfono/)).not.toHaveAttribute("aria-required");
  });

  it("muestra el asterisco rojo en nueve etiquetas y no en la del teléfono", () => {
    const { container } = renderForm();

    const marks = Array.from(container.querySelectorAll("form span[aria-hidden='true'].text-accent"));
    expect(marks).toHaveLength(9);
    expect(screen.getByText(/Teléfono/).textContent).not.toContain("*");
  });

  it("muestra el botón Continuar al siguiente paso", () => {
    renderForm();

    expect(screen.getByRole("button", { name: "Continuar al siguiente paso" })).toBeInTheDocument();
  });

  it("no recarga la página al enviar", () => {
    const { container } = renderForm();

    const notPrevented = fireEvent.submit(container.querySelector("form") as HTMLFormElement);

    expect(notPrevented).toBe(false);
  });

  it("no usa el término egresado", () => {
    const { container } = renderForm();

    expect(container.textContent).not.toMatch(/egres/i);
  });
});
