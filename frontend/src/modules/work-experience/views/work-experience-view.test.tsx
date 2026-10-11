import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WORK_EXPERIENCE_FEEDBACK_MESSAGES } from "../config/work-experience-feedback.config";
import { workExperienceService } from "../services/work-experience.service";
import type { WorkExperienceItem } from "../types/work-experience-item.types";
import { WorkExperienceView } from "./work-experience-view";

vi.mock("../services/work-experience.service", () => ({
  workExperienceService: {
    getWorkExperiences: vi.fn(),
    createWorkExperience: vi.fn(),
    updateWorkExperience: vi.fn(),
    deleteWorkExperience: vi.fn(),
  },
}));

const CURRENT_JOB: WorkExperienceItem = {
  id: "experience-1",
  companyName: "Synapse Labs",
  position: "Desarrolladora web junior",
  startDate: "2025-03-01",
  endDate: null,
  isCurrent: true,
  description: null,
};

const PAST_JOB: WorkExperienceItem = {
  id: "experience-2",
  companyName: "Tecnored",
  position: "Asistente de laboratorio",
  startDate: "2023-03-01",
  endDate: "2024-12-01",
  isCurrent: false,
  description: "Apoyo en prácticas de redes",
};

describe("WorkExperienceView", () => {
  beforeEach(() => {
    vi.mocked(workExperienceService.getWorkExperiences).mockResolvedValue([PAST_JOB, CURRENT_JOB]);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows the saved experiences with their period", async () => {
    render(<WorkExperienceView />);

    expect(screen.getByRole("heading", { level: 1, name: "Trayectoria" })).toBeInTheDocument();
    expect(screen.getByText("Cargando experiencia laboral...")).toBeInTheDocument();
    expect(await screen.findByText("Desarrolladora web junior")).toBeInTheDocument();
    expect(screen.getByText(/Mar 2025 – Actualidad/)).toBeInTheDocument();
    expect(screen.getByText(/Mar 2023 – Dic 2024/)).toBeInTheDocument();
    expect(screen.getByText("Experiencia laboral").closest("li")).toHaveAttribute(
      "aria-current",
      "step",
    );
  });

  it("shows the empty message when there are no experiences", async () => {
    vi.mocked(workExperienceService.getWorkExperiences).mockResolvedValue([]);
    render(<WorkExperienceView />);

    expect(await screen.findByText("Aún no registraste experiencia laboral.")).toBeInTheDocument();
  });

  it("shows an error when the experiences cannot be loaded", async () => {
    vi.mocked(workExperienceService.getWorkExperiences).mockRejectedValue(new Error("fail"));
    render(<WorkExperienceView />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      WORK_EXPERIENCE_FEEDBACK_MESSAGES.loadError,
    );
  });

  it("creates an experience and reloads the list", async () => {
    const user = userEvent.setup();
    vi.mocked(workExperienceService.createWorkExperience).mockResolvedValue(CURRENT_JOB);
    render(<WorkExperienceView />);
    await screen.findByText("Desarrolladora web junior");

    await user.type(screen.getByLabelText(/Empresa/), "Synapse Labs");
    await user.type(screen.getByLabelText(/Cargo/), "Desarrolladora web junior");
    fireEvent.change(screen.getByLabelText(/Desde/), { target: { value: "2025-03-01" } });
    await user.click(screen.getByRole("checkbox", { name: "Trabajo actualmente aquí" }));
    await user.click(screen.getByRole("button", { name: "Guardar experiencia" }));

    expect(workExperienceService.createWorkExperience).toHaveBeenCalledWith(
      expect.objectContaining({
        companyName: "Synapse Labs",
        position: "Desarrolladora web junior",
        endDate: null,
        isCurrent: true,
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      WORK_EXPERIENCE_FEEDBACK_MESSAGES.createSuccess,
    );
    await waitFor(() =>
      expect(workExperienceService.getWorkExperiences).toHaveBeenCalledTimes(2),
    );
    expect(screen.getByLabelText(/Empresa/)).toHaveValue("");
  });

  it("edits an experience from the list", async () => {
    const user = userEvent.setup();
    vi.mocked(workExperienceService.updateWorkExperience).mockResolvedValue(PAST_JOB);
    render(<WorkExperienceView />);
    await screen.findByText("Asistente de laboratorio");

    await user.click(screen.getByRole("button", { name: "Editar Asistente de laboratorio" }));

    expect(screen.getByRole("form", { name: "Editar experiencia" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Empresa/)).toHaveValue("Tecnored");

    await user.click(screen.getByRole("button", { name: "Guardar experiencia" }));

    expect(workExperienceService.updateWorkExperience).toHaveBeenCalledWith(
      "experience-2",
      expect.objectContaining({ companyName: "Tecnored", endDate: "2024-12-01" }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      WORK_EXPERIENCE_FEEDBACK_MESSAGES.updateSuccess,
    );
  });

  it("shows an error when an experience cannot be saved", async () => {
    const user = userEvent.setup();
    vi.mocked(workExperienceService.updateWorkExperience).mockRejectedValue(new Error("fail"));
    render(<WorkExperienceView />);
    await screen.findByText("Asistente de laboratorio");

    await user.click(screen.getByRole("button", { name: "Editar Asistente de laboratorio" }));
    await user.click(screen.getByRole("button", { name: "Guardar experiencia" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      WORK_EXPERIENCE_FEEDBACK_MESSAGES.updateError,
    );
  });

  it("asks for confirmation and keeps the experience when the deletion is cancelled", async () => {
    const user = userEvent.setup();
    render(<WorkExperienceView />);
    await screen.findByText("Asistente de laboratorio");

    await user.click(screen.getByRole("button", { name: "Eliminar Asistente de laboratorio" }));

    const dialog = await screen.findByRole("alertdialog");
    expect(dialog).toHaveTextContent('Se eliminará "Asistente de laboratorio" de tu perfil.');

    await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(workExperienceService.deleteWorkExperience).not.toHaveBeenCalled();
    expect(screen.getByText("Asistente de laboratorio")).toBeInTheDocument();
  });

  it("deletes the experience after confirming and reloads the list", async () => {
    const user = userEvent.setup();
    vi.mocked(workExperienceService.deleteWorkExperience).mockResolvedValue();
    render(<WorkExperienceView />);
    await screen.findByText("Asistente de laboratorio");

    await user.click(screen.getByRole("button", { name: "Eliminar Asistente de laboratorio" }));
    await user.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Eliminar" }),
    );

    expect(workExperienceService.deleteWorkExperience).toHaveBeenCalledWith("experience-2");
    expect(await screen.findByRole("status")).toHaveTextContent(
      WORK_EXPERIENCE_FEEDBACK_MESSAGES.deleteSuccess,
    );
    await waitFor(() =>
      expect(workExperienceService.getWorkExperiences).toHaveBeenCalledTimes(2),
    );
  });

  it("clears the form when the experience being edited is deleted", async () => {
    const user = userEvent.setup();
    vi.mocked(workExperienceService.deleteWorkExperience).mockResolvedValue();
    render(<WorkExperienceView />);
    await screen.findByText("Asistente de laboratorio");

    await user.click(screen.getByRole("button", { name: "Editar Asistente de laboratorio" }));
    expect(screen.getByRole("form", { name: "Editar experiencia" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Eliminar Asistente de laboratorio" }));
    await user.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Eliminar" }),
    );

    expect(await screen.findByRole("form", { name: "Agregar experiencia" })).toBeInTheDocument();
  });

  it("shows an error when the experience cannot be deleted", async () => {
    const user = userEvent.setup();
    vi.mocked(workExperienceService.deleteWorkExperience).mockRejectedValue(new Error("fail"));
    render(<WorkExperienceView />);
    await screen.findByText("Asistente de laboratorio");

    await user.click(screen.getByRole("button", { name: "Eliminar Asistente de laboratorio" }));
    await user.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Eliminar" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      WORK_EXPERIENCE_FEEDBACK_MESSAGES.deleteError,
    );
    expect(screen.getByText("Asistente de laboratorio")).toBeInTheDocument();
  });

  it("blocks editing and deleting other experiences while one is being saved", async () => {
    const user = userEvent.setup();
    let finishSave: (value: WorkExperienceItem) => void = () => undefined;
    vi.mocked(workExperienceService.updateWorkExperience).mockReturnValue(
      new Promise((resolve) => {
        finishSave = resolve;
      }),
    );
    render(<WorkExperienceView />);
    await screen.findByText("Asistente de laboratorio");

    await user.click(screen.getByRole("button", { name: "Editar Asistente de laboratorio" }));
    await user.click(screen.getByRole("button", { name: "Guardar experiencia" }));

    expect(screen.getByRole("button", { name: "Editar Desarrolladora web junior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Eliminar Desarrolladora web junior" })).toBeDisabled();

    finishSave(PAST_JOB);

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Editar Desarrolladora web junior" }),
      ).toBeEnabled(),
    );
  });

  it("goes back to the add form when the edition is cancelled", async () => {
    const user = userEvent.setup();
    render(<WorkExperienceView />);
    await screen.findByText("Asistente de laboratorio");

    await user.click(screen.getByRole("button", { name: "Editar Asistente de laboratorio" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.getByRole("form", { name: "Agregar experiencia" })).toBeInTheDocument();
  });
});
