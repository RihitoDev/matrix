import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getMentorTechnicalAreas,
  updateMentorTechnicalAreas,
} from "../services/technical-areas.service";
import { TechnicalAreasView } from "./technical-areas-view";
import { getTechnicalAreas } from "@/modules/mentorship/services/technical-area.service";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("../services/technical-areas.service", () => ({
  getMentorTechnicalAreas: vi.fn(),
  updateMentorTechnicalAreas: vi.fn(),
}));
vi.mock("@/modules/mentorship/services/technical-area.service", () => ({
  getTechnicalAreas: vi.fn(),
}));

const catalog = [
  {
    id: "0424f370-00f0-43cf-9b8a-997af81840b9",
    name: "Backend",
    description: "APIs y lógica de negocio",
  },
  {
    id: "0fa5e6de-63a4-430e-87fb-22f5eb700ecd",
    name: "QA",
    description: "Testing y calidad",
  },
  {
    id: "b679c31a-2545-43a9-91ac-f254b49e7b0c",
    name: "Cloud",
    description: null,
  },
];

const selectedAreas = [catalog[0], catalog[2]];
const card = (name: RegExp) => screen.getByRole("checkbox", { name });
const button = (name: RegExp | string) => screen.getByRole("button", { name });

describe("TechnicalAreasView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getTechnicalAreas).mockResolvedValue(catalog);
    vi.mocked(getMentorTechnicalAreas).mockResolvedValue(selectedAreas);
    vi.mocked(updateMentorTechnicalAreas).mockResolvedValue();
  });

  afterEach(cleanup);

  it("muestra carga y precarga la seleccion persistida", async () => {
    render(<TechnicalAreasView />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Cargando áreas técnicas",
    );
    expect(await screen.findByText("2 seleccionadas")).toBeInTheDocument();
    expect(card(/Backend/)).toHaveAttribute("aria-checked", "true");
    expect(card(/Cloud/)).toHaveAttribute("aria-checked", "true");
    expect(card(/QA/)).toHaveAttribute("aria-checked", "false");
  });

  it("desmarcar todo muestra la alerta y bloquea Guardar", async () => {
    render(<TechnicalAreasView />);
    await screen.findByText("2 seleccionadas");

    fireEvent.click(card(/Backend/));
    fireEvent.click(card(/Cloud/));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Debe seleccionarse al menos un área",
    );
    expect(button(/Guardar cambios/)).toBeDisabled();
  });

  it("guarda UUID reales y muestra el mensaje de exito", async () => {
    render(<TechnicalAreasView />);
    await screen.findByText("2 seleccionadas");

    fireEvent.click(card(/QA/));
    fireEvent.click(button(/Guardar cambios/));

    expect(
      await screen.findByText("Áreas técnicas actualizadas correctamente"),
    ).toBeInTheDocument();
    expect(updateMentorTechnicalAreas).toHaveBeenCalledWith([
      catalog[0].id,
      catalog[2].id,
      catalog[1].id,
    ]);
  });

  it("si falla el guardado conserva la seleccion actual", async () => {
    vi.mocked(updateMentorTechnicalAreas).mockRejectedValueOnce(
      new Error("500"),
    );
    render(<TechnicalAreasView />);
    await screen.findByText("2 seleccionadas");

    fireEvent.click(card(/QA/));
    fireEvent.click(button(/Guardar cambios/));

    expect(
      await screen.findByText(
        "No se pudieron guardar los cambios. Intente nuevamente.",
      ),
    ).toBeInTheDocument();
    expect(card(/QA/)).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("3 seleccionadas")).toBeInTheDocument();
  });

  it("muestra error de carga y permite reintentar", async () => {
    vi.mocked(getTechnicalAreas)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(catalog);
    render(<TechnicalAreasView />);

    expect(
      await screen.findByText("No se pudieron cargar las áreas técnicas."),
    ).toBeInTheDocument();
    fireEvent.click(button("Reintentar"));

    expect(await screen.findByText("2 seleccionadas")).toBeInTheDocument();
    expect(getTechnicalAreas).toHaveBeenCalledTimes(2);
    expect(getMentorTechnicalAreas).toHaveBeenCalledTimes(2);
  });

  it("Volver sin cambios regresa directo a Mi participación", async () => {
    render(<TechnicalAreasView />);
    await screen.findByText("2 seleccionadas");

    fireEvent.click(button(/Volver/));

    expect(push).toHaveBeenCalledWith("/mentors/participation");
  });

  it("confirma antes de salir con cambios sin guardar", async () => {
    render(<TechnicalAreasView />);
    await screen.findByText("2 seleccionadas");

    fireEvent.click(card(/QA/));
    fireEvent.click(button(/Volver/));
    expect(screen.getByText("¿Descartar cambios?")).toBeInTheDocument();

    fireEvent.click(button("Seguir editando"));
    expect(screen.queryByText("¿Descartar cambios?")).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("descarta los cambios y regresa a Mi participación", async () => {
    render(<TechnicalAreasView />);
    await screen.findByText("2 seleccionadas");

    fireEvent.click(card(/QA/));
    fireEvent.click(button(/Volver/));
    await act(async () => fireEvent.click(button("Descartar")));

    expect(push).toHaveBeenCalledWith("/mentors/participation");
  });
});
