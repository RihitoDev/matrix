import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DOCKER, KUBERNETES, PYTHON } from "../testing/vacancy-fixtures";
import { SkillSearchDialog } from "./skill-search-dialog";

const FASTAPI = { id: "44444444-4444-4444-8444-444444444444", name: "FastAPI" };
const CATALOG = [PYTHON, DOCKER, KUBERNETES, FASTAPI];

function renderDialog(overrides: Partial<React.ComponentProps<typeof SkillSearchDialog>> = {}) {
  const props = { catalog: CATALOG, selected: [], isDisabled: false, onAdd: vi.fn(), ...overrides };
  render(<SkillSearchDialog {...props} />);
  return props;
}

function openDialog() {
  fireEvent.click(screen.getByRole("button", { name: "+ Añadir habilidad" }));
  return screen.getByLabelText(/Buscar tecnología/);
}

const addButton = () => screen.getByRole("button", { name: "Añadir habilidad" });

describe("SkillSearchDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("abre el pop up Buscar habilidad con el buscador", () => {
    renderDialog();

    openDialog();

    expect(screen.getByText("Buscar habilidad")).toBeInTheDocument();
    expect(addButton()).toBeDisabled();
  });

  it("filtra sin distinguir mayúsculas ni tildes", () => {
    renderDialog();
    const search = openDialog();

    fireEvent.change(search, { target: { value: "FASTAPI" } });
    expect(screen.getByRole("button", { name: "FastAPI" })).toBeInTheDocument();

    fireEvent.change(search, { target: { value: "dócker" } });
    expect(screen.getByRole("button", { name: "Docker" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Python" })).not.toBeInTheDocument();
  });

  it("agrega la tecnología elegida y cierra el pop up", async () => {
    const { onAdd } = renderDialog();
    const search = openDialog();

    fireEvent.change(search, { target: { value: "kube" } });
    fireEvent.click(screen.getByRole("button", { name: "Kubernetes" }));
    expect(search).toHaveValue("Kubernetes");
    fireEvent.click(addButton());

    expect(onAdd).toHaveBeenCalledWith(KUBERNETES);
    await waitFor(() => expect(screen.queryByText("Buscar habilidad")).not.toBeInTheDocument());
  });

  it("informa que no hay coincidencias, mantiene el botón deshabilitado y vuelve a mostrar resultados", () => {
    renderDialog();
    const search = openDialog();

    fireEvent.change(search, { target: { value: "cobol" } });
    expect(screen.getByRole("status")).toHaveTextContent("No se encontraron coincidencias");
    expect(addButton()).toBeDisabled();

    fireEvent.change(search, { target: { value: "py" } });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Python" })).toBeInTheDocument();
  });

  it("muestra las tecnologías ya elegidas como deshabilitadas", () => {
    renderDialog({ selected: [DOCKER] });
    const search = openDialog();

    fireEvent.change(search, { target: { value: "docker" } });

    const option = screen.getByRole("button", { name: /Docker/ });
    expect(option).toBeDisabled();
    expect(option).toHaveTextContent("Ya seleccionada");
  });

  it("cambiar el texto descarta la selección anterior", () => {
    renderDialog();
    const search = openDialog();
    fireEvent.change(search, { target: { value: "py" } });
    fireEvent.click(screen.getByRole("button", { name: "Python" }));
    expect(addButton()).toBeEnabled();

    fireEvent.change(search, { target: { value: "do" } });

    expect(addButton()).toBeDisabled();
  });

  it("cancelar cierra sin agregar y limpia la búsqueda", async () => {
    const { onAdd } = renderDialog();
    const search = openDialog();
    fireEvent.change(search, { target: { value: "py" } });
    fireEvent.click(screen.getByRole("button", { name: "Python" }));

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onAdd).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText("Buscar habilidad")).not.toBeInTheDocument());
    expect(openDialog()).toHaveValue("");
  });

  it("la tecla Escape cierra sin agregar", async () => {
    const { onAdd } = renderDialog();
    const search = openDialog();

    fireEvent.keyDown(search, { key: "Escape" });

    await waitFor(() => expect(screen.queryByText("Buscar habilidad")).not.toBeInTheDocument());
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("deshabilita el botón de apertura al llegar al tope", () => {
    renderDialog({ isDisabled: true });

    expect(screen.getByRole("button", { name: "+ Añadir habilidad" })).toBeDisabled();
  });
});
