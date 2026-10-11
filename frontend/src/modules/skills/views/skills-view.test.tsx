import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { skillsService } from "../services/skills.service";
import { SkillsView } from "./skills-view";

vi.mock("../services/skills.service", () => ({
  skillsService: {
    getCatalog: vi.fn(),
    getMySkills: vi.fn(),
    createCustomSkill: vi.fn(),
    saveMySkills: vi.fn(),
  },
}));

const PYTHON = { id: "33333333-3333-4333-8333-333333333333", name: "Python" };
const SQL = { id: "44444444-4444-4444-8444-444444444444", name: "SQL" };

describe("SkillsView", () => {
  beforeEach(() => {
    vi.mocked(skillsService.getCatalog).mockResolvedValue([PYTHON, SQL]);
    vi.mocked(skillsService.getMySkills).mockResolvedValue([PYTHON]);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows a loading message and then the saved skills", async () => {
    render(<SkillsView />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando habilidades...");
    expect(await screen.findByRole("button", { name: "Quitar Python" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Trayectoria" })).toBeInTheDocument();
    expect(screen.getByText("Habilidades técnicas")).toBeInTheDocument();
  });

  it("marks Habilidades as the active step", async () => {
    render(<SkillsView />);

    await screen.findByRole("button", { name: "Quitar Python" });
    expect(screen.getByText("Habilidades").closest("li")).toHaveAttribute("aria-current", "step");
  });

  it("adds a catalog skill and saves the whole list", async () => {
    const user = userEvent.setup();
    vi.mocked(skillsService.saveMySkills).mockResolvedValue([PYTHON, SQL]);
    render(<SkillsView />);

    await screen.findByRole("button", { name: "Quitar Python" });
    await user.click(screen.getByRole("button", { name: "Añadir" }));
    await user.click(screen.getByRole("button", { name: "Guardar habilidades" }));

    expect(skillsService.saveMySkills).toHaveBeenCalledWith([PYTHON.id, SQL.id]);
    expect(await screen.findByText("Tus habilidades se guardaron correctamente.")).toBeInTheDocument();
  });

  it("disables save button on load error and allows retry", async () => {
    const user = userEvent.setup();
    vi.mocked(skillsService.getMySkills).mockRejectedValueOnce(new Error("Network Error"));

    render(<SkillsView />);

    expect(
      await screen.findByText("No se pudieron cargar tus habilidades. Intenta de nuevo más tarde."),
    ).toBeInTheDocument();

    const saveButton = screen.getByRole("button", { name: "Guardar habilidades" });
    expect(saveButton).toBeDisabled();

    const retryButton = screen.getByRole("button", { name: "Reintentar" });
    expect(retryButton).toBeInTheDocument();

    vi.mocked(skillsService.getMySkills).mockResolvedValue([PYTHON]);
    await user.click(retryButton);

    expect(await screen.findByRole("button", { name: "Quitar Python" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar habilidades" })).toBeEnabled();
  });
});
