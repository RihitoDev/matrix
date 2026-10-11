import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getMentorOrientationTypes,
  getOrientationTypes,
  updateMentorOrientationTypes,
} from "../services/orientation-type.service";
import { OrientationConfigView } from "./orientation-config-view";

vi.mock("../services/orientation-type.service", () => ({
  getOrientationTypes: vi.fn(),
  getMentorOrientationTypes: vi.fn(),
  updateMentorOrientationTypes: vi.fn(),
}));

const catalog = [
  {
    id: "0424f370-00f0-43cf-9b8a-997af81840b9",
    name: "Búsqueda de empleo",
    description: "Preparación para oportunidades laborales",
  },
  {
    id: "0fa5e6de-63a4-430e-87fb-22f5eb700ecd",
    name: "Orientación profesional",
    description: null,
  },
  {
    id: "b679c31a-2545-43a9-91ac-f254b49e7b0c",
    name: "Orientación técnica",
    description: "Decisiones y crecimiento técnico",
  },
];

const selectedOrientations = [catalog[0], catalog[2]];
const checkbox = (name: RegExp | string) =>
  screen.getByRole("checkbox", { name });

describe("OrientationConfigView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getOrientationTypes).mockResolvedValue(catalog);
    vi.mocked(getMentorOrientationTypes).mockResolvedValue(
      selectedOrientations,
    );
    vi.mocked(updateMentorOrientationTypes).mockResolvedValue();
  });

  afterEach(cleanup);

  it("muestra loading mientras carga las consultas", () => {
    vi.mocked(getOrientationTypes).mockReturnValue(new Promise(() => {}));
    vi.mocked(getMentorOrientationTypes).mockReturnValue(new Promise(() => {}));

    render(<OrientationConfigView />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Cargando tu participación como mentor",
    );
  });

  it("carga el catalogo real y precarga los UUID guardados", async () => {
    render(<OrientationConfigView />);

    expect(
      await screen.findByText(catalog[0].description ?? ""),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(catalog.length);
    expect(checkbox("Búsqueda de empleo")).toBeChecked();
    expect(checkbox("Orientación técnica")).toBeChecked();
    expect(checkbox("Orientación profesional")).not.toBeChecked();
    expect(getOrientationTypes).toHaveBeenCalledTimes(1);
    expect(getMentorOrientationTypes).toHaveBeenCalledTimes(1);
  });

  it("permite agregar y quitar multiples orientaciones", async () => {
    render(<OrientationConfigView />);
    await screen.findByRole("checkbox", { name: "Orientación profesional" });

    fireEvent.click(checkbox("Orientación profesional"));
    fireEvent.click(checkbox("Orientación técnica"));

    expect(checkbox("Orientación profesional")).toBeChecked();
    expect(checkbox("Orientación técnica")).not.toBeChecked();
    expect(checkbox("Búsqueda de empleo")).toBeChecked();
  });

  it("exige al menos una orientacion", async () => {
    vi.mocked(getMentorOrientationTypes).mockResolvedValue([catalog[0]]);
    render(<OrientationConfigView />);
    await screen.findByRole("checkbox", { name: "Búsqueda de empleo" });

    fireEvent.click(checkbox("Búsqueda de empleo"));

    expect(
      screen.getByRole("button", { name: "Guardar cambios" }),
    ).toBeDisabled();
    expect(updateMentorOrientationTypes).not.toHaveBeenCalled();
  });

  it("guarda exactamente los UUID seleccionados y muestra exito", async () => {
    render(<OrientationConfigView />);
    await screen.findByRole("checkbox", { name: "Orientación profesional" });

    fireEvent.click(checkbox("Orientación profesional"));
    fireEvent.click(checkbox("Orientación técnica"));
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(
      await screen.findByText(
        "Tipos de orientación actualizados correctamente",
      ),
    ).toBeInTheDocument();
    expect(updateMentorOrientationTypes).toHaveBeenCalledWith([
      catalog[0].id,
      catalog[1].id,
    ]);
  });

  it("conserva la seleccion si falla el guardado", async () => {
    vi.mocked(updateMentorOrientationTypes).mockRejectedValueOnce(
      new Error("500"),
    );
    render(<OrientationConfigView />);
    await screen.findByRole("checkbox", { name: "Orientación profesional" });

    fireEvent.click(checkbox("Orientación profesional"));
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(
      await screen.findByText(
        "No se pudieron guardar los cambios. Intente nuevamente.",
      ),
    ).toBeInTheDocument();
    expect(checkbox("Orientación profesional")).toBeChecked();
    expect(checkbox("Búsqueda de empleo")).toBeChecked();
    expect(checkbox("Orientación técnica")).toBeChecked();
  });

  it("muestra error de carga y reintenta ambas consultas", async () => {
    vi.mocked(getOrientationTypes)
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 404 },
      })
      .mockResolvedValueOnce(catalog);
    render(<OrientationConfigView />);

    expect(
      await screen.findByText(
        "No se pudieron cargar los tipos de orientación.",
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(
      await screen.findByRole("checkbox", { name: "Orientación técnica" }),
    ).toBeChecked();
    expect(getOrientationTypes).toHaveBeenCalledTimes(2);
    expect(getMentorOrientationTypes).toHaveBeenCalledTimes(2);
  });

  it("muestra activacion cuando el backend informa que no es mentor activo", async () => {
    vi.mocked(getMentorOrientationTypes).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404 },
    });
    render(<OrientationConfigView />);

    expect(
      await screen.findByText(
        /Primero debes activar tu participación como mentor/i,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Activar participación como mentor" }),
    ).toHaveAttribute("href", "/mentorship");
  });

  it("no depende de localStorage", async () => {
    const readStorage = vi.spyOn(Storage.prototype, "getItem");
    const writeStorage = vi.spyOn(Storage.prototype, "setItem");

    render(<OrientationConfigView />);
    await screen.findByRole("checkbox", { name: "Orientación técnica" });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await screen.findByText("Tipos de orientación actualizados correctamente");
    expect(readStorage).not.toHaveBeenCalled();
    expect(writeStorage).not.toHaveBeenCalled();
    readStorage.mockRestore();
    writeStorage.mockRestore();
  });

  it("mantiene Volver dirigido a Mi participación", async () => {
    render(<OrientationConfigView />);

    expect(await screen.findByRole("link", { name: "Volver" })).toHaveAttribute(
      "href",
      "/mentors/participation",
    );
  });
});
