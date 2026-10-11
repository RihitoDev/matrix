import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMentorTechnicalAreas } from "../services/technical-areas.service";
import { getMentorOrientationTypes } from "@/modules/mentorship/services/orientation-type.service";
import { ParticipationView } from "./participation-view";

vi.mock("../services/technical-areas.service", () => ({
  getMentorTechnicalAreas: vi.fn(),
}));
vi.mock("@/modules/mentorship/services/orientation-type.service", () => ({
  getMentorOrientationTypes: vi.fn(),
}));

describe("ParticipationView", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(getMentorTechnicalAreas).mockResolvedValue([
      { id: "area-1", name: "Backend", description: null },
      { id: "area-2", name: "QA", description: null },
    ]);
    vi.mocked(getMentorOrientationTypes).mockResolvedValue([
      { id: "orientation-1", name: "Orientación profesional", description: null },
      { id: "orientation-2", name: "Búsqueda de empleo", description: null },
    ]);
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("mantiene un estado inicial estable mientras resuelve la participación", () => {
    const html = renderToString(<ParticipationView />);

    expect(html).toContain("Cargando participación...");
    expect(html).not.toContain("Mi participación como mentor");
    expect(html).not.toContain("Participa como mentor");
  });

  it("muestra la participación activa con sus datos y enlaces de edición", async () => {
    render(<ParticipationView />);

    expect(
      await screen.findByRole("heading", { name: "Mi participación como mentor" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Backend")).toBeInTheDocument();
    expect(screen.getByText("QA")).toBeInTheDocument();
    expect(screen.getByText("Orientación profesional")).toBeInTheDocument();
    expect(screen.getByText("Búsqueda de empleo")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Editar áreas técnicas" }),
    ).toHaveAttribute("href", "/mentors/participation/technical-areas");
    expect(
      screen.getByRole("link", { name: "Editar tipos de orientación" }),
    ).toHaveAttribute("href", "/mentorship/orientation");
  });

  it("muestra la activación cuando no existe participación", async () => {
    vi.mocked(getMentorTechnicalAreas).mockRejectedValue({
      isAxiosError: true,
      response: { status: 404 },
    });
    render(<ParticipationView />);

    expect(
      await screen.findByRole("heading", { name: "Mi participación" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Participa como mentor" }),
    ).toHaveAttribute("href", "/mentorship");
  });

  it("muestra loading hasta que ambas peticiones terminan y comparte la cancelación", () => {
    vi.mocked(getMentorTechnicalAreas).mockReturnValue(new Promise(() => {}));
    const { unmount } = render(<ParticipationView />);
    expect(screen.getByText("Cargando participación...")).toBeInTheDocument();
    const signal = vi.mocked(getMentorTechnicalAreas).mock.calls[0][0];
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(getMentorOrientationTypes).toHaveBeenCalledWith(signal);
    unmount();
    expect(signal?.aborted).toBe(true);
  });

  it("muestra errores reales y permite reintentar", async () => {
    vi.mocked(getMentorOrientationTypes).mockRejectedValueOnce(new Error("Network"));
    render(<ParticipationView />);
    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo cargar");
    expect(screen.queryByText("Participa como mentor")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByText("Backend")).toBeInTheDocument();
    expect(getMentorTechnicalAreas).toHaveBeenCalledTimes(2);
    expect(getMentorOrientationTypes).toHaveBeenCalledTimes(2);
  });

  it("no oculta un error real aunque el otro endpoint devuelva 404", async () => {
    vi.mocked(getMentorTechnicalAreas).mockRejectedValue({
      isAxiosError: true,
      response: { status: 404 },
    });
    vi.mocked(getMentorOrientationTypes).mockRejectedValue({
      isAxiosError: true,
      response: { status: 500 },
    });
    render(<ParticipationView />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("ignora los datos antiguos de localStorage y muestra nombres del backend", async () => {
    localStorage.setItem(
      "umssy-mentor-participation",
      JSON.stringify({ status: "active", areas: ["Datos antiguos"], orientations: [] }),
    );
    const readStorage = vi.spyOn(Storage.prototype, "getItem");
    render(<ParticipationView />);
    expect(await screen.findByText("Backend")).toBeInTheDocument();
    expect(screen.queryByText("Datos antiguos")).not.toBeInTheDocument();
    expect(readStorage).not.toHaveBeenCalled();
  });
});
