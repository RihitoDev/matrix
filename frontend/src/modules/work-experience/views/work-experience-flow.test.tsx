import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { workExperienceService } from "../services/work-experience.service";
import type { WorkExperienceItem } from "../types/work-experience-item.types";
import type { WorkExperiencePayload } from "../types/work-experience-payload.types";
import { WorkExperienceView } from "./work-experience-view";

vi.mock("../services/work-experience.service", () => ({
  workExperienceService: {
    getWorkExperiences: vi.fn(),
    createWorkExperience: vi.fn(),
    updateWorkExperience: vi.fn(),
    deleteWorkExperience: vi.fn(),
  },
}));

function useInMemoryService() {
  let records: WorkExperienceItem[] = [];
  let sequence = 0;

  vi.mocked(workExperienceService.getWorkExperiences).mockImplementation(() =>
    Promise.resolve([...records]),
  );
  vi.mocked(workExperienceService.createWorkExperience).mockImplementation(
    (payload: WorkExperiencePayload) => {
      sequence += 1;
      const created = { id: `experience-${sequence}`, ...payload };
      records = [...records, created];
      return Promise.resolve(created);
    },
  );
  vi.mocked(workExperienceService.updateWorkExperience).mockImplementation(
    (id: string, payload: WorkExperiencePayload) => {
      const updated = { id, ...payload };
      records = records.map((record) => (record.id === id ? updated : record));
      return Promise.resolve(updated);
    },
  );
  vi.mocked(workExperienceService.deleteWorkExperience).mockImplementation((id: string) => {
    records = records.filter((record) => record.id !== id);
    return Promise.resolve();
  });
}

async function addExperience(
  user: ReturnType<typeof userEvent.setup>,
  values: { companyName: string; position: string; startDate: string; endDate?: string },
) {
  await user.type(screen.getByLabelText(/Empresa/), values.companyName);
  await user.type(screen.getByLabelText(/Cargo/), values.position);
  fireEvent.change(screen.getByLabelText(/Desde/), { target: { value: values.startDate } });
  if (values.endDate) {
    fireEvent.change(screen.getByLabelText("Hasta"), { target: { value: values.endDate } });
  } else {
    await user.click(screen.getByRole("checkbox", { name: "Trabajo actualmente aquí" }));
  }
  await user.click(screen.getByRole("button", { name: "Guardar experiencia" }));
  await screen.findByText(values.position);
}

describe("WorkExperienceView flow", () => {
  beforeEach(() => {
    useInMemoryService();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("creates two experiences, edits one, cancels a deletion and deletes only the confirmed one", async () => {
    const user = userEvent.setup();
    render(<WorkExperienceView />);
    expect(await screen.findByText("Aún no registraste experiencia laboral.")).toBeInTheDocument();

    await addExperience(user, {
      companyName: "Tecnored",
      position: "Asistente de laboratorio",
      startDate: "2023-03-01",
      endDate: "2024-12-31",
    });
    await addExperience(user, {
      companyName: "Synapse Labs",
      position: "Desarrolladora web junior",
      startDate: "2025-03-01",
    });

    const list = screen.getByText("Asistente de laboratorio").closest("ul") as HTMLElement;
    expect(within(list).getAllByRole("heading").map((item) => item.textContent)).toEqual([
      "Desarrolladora web junior",
      "Asistente de laboratorio",
    ]);
    expect(screen.getByText(/Mar 2025 – Actualidad/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Editar Asistente de laboratorio" }));
    const position = screen.getByLabelText(/Cargo/);
    await user.clear(position);
    await user.type(position, "Técnico de laboratorio");
    await user.click(screen.getByRole("button", { name: "Guardar experiencia" }));

    expect(await screen.findByText("Técnico de laboratorio")).toBeInTheDocument();
    expect(screen.queryByText("Asistente de laboratorio")).not.toBeInTheDocument();
    expect(workExperienceService.updateWorkExperience).toHaveBeenCalledWith(
      "experience-1",
      expect.objectContaining({ companyName: "Tecnored", position: "Técnico de laboratorio" }),
    );

    await user.click(screen.getByRole("button", { name: "Eliminar Técnico de laboratorio" }));
    await user.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Cancelar" }),
    );
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(screen.getByText("Técnico de laboratorio")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Eliminar Desarrolladora web junior" }));
    await user.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Eliminar" }),
    );

    await waitFor(() =>
      expect(screen.queryByText("Desarrolladora web junior")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Técnico de laboratorio")).toBeInTheDocument();
    expect(workExperienceService.deleteWorkExperience).toHaveBeenCalledTimes(1);
    expect(workExperienceService.deleteWorkExperience).toHaveBeenCalledWith("experience-2");
  }, 20_000);

  it("does not save an experience with invalid dates and keeps the saved ones", async () => {
    const user = userEvent.setup();
    render(<WorkExperienceView />);
    await screen.findByText("Aún no registraste experiencia laboral.");

    await addExperience(user, {
      companyName: "Tecnored",
      position: "Asistente de laboratorio",
      startDate: "2023-03-01",
      endDate: "2024-12-31",
    });

    await user.type(screen.getByLabelText(/Empresa/), "UMSS");
    await user.type(screen.getByLabelText(/Cargo/), "Practicante");
    fireEvent.change(screen.getByLabelText(/Desde/), { target: { value: "2024-07-01" } });
    fireEvent.change(screen.getByLabelText("Hasta"), { target: { value: "2024-06-30" } });
    await user.click(screen.getByRole("button", { name: "Guardar experiencia" }));

    expect(
      screen.getByText("La fecha de fin no puede ser anterior a la fecha de inicio."),
    ).toBeInTheDocument();
    expect(workExperienceService.createWorkExperience).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Asistente de laboratorio")).toBeInTheDocument();
    expect(screen.queryByText("Practicante")).not.toBeInTheDocument();
  }, 20_000);
});
