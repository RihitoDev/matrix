import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AffinityAxisId } from "../types/matching-types";
import { AFFINITY_AXES } from "../data/matching.data";
import { getCandidatesForVacancy, getVacancyById } from "../services/matching.service";
import { CandidateDetailPanel } from "./candidate-detail-panel";

vi.mock("./radar-chart", () => ({
  RadarChart: ({ onAxisSelect }: { onAxisSelect: (area: AffinityAxisId) => void }) => (
    <div>
      <button type="button" onClick={() => onAxisSelect("data-ai")}>Seleccionar Data/AI</button>
      <button type="button" onClick={() => onAxisSelect("cloud-devops")}>Seleccionar Cloud/DevOps</button>
    </div>
  ),
}));

afterEach(() => cleanup());

const noop = () => undefined;
const vacancy = getVacancyById("vac-tech-lead")!;
const candidates = getCandidatesForVacancy("vac-tech-lead");
const lucia = candidates.find((candidate) => candidate.id === "cand-lucia-flores")!;
const carlos = candidates.find((candidate) => candidate.id === "cand-carlos-mendoza")!;

function renderPanel(candidate: typeof lucia) {
  return <CandidateDetailPanel
    key={candidate.id}
    candidate={candidate}
    vacancy={vacancy}
    axes={AFFINITY_AXES}
    pendingDiscardId={null}
    onRequestDiscard={noop}
    onConfirmDiscard={noop}
    onCancelDiscard={noop}
    onConfirmSchedule={noop}
    actionFeedback={null}
  />;
}

describe("Integración HU3 → HU4", () => {
  it("abre detalle del candidato y área, cambia de eje y lo cierra sin retirar las brechas", () => {
    render(renderPanel(lucia));
    fireEvent.click(screen.getByRole("button", { name: "Seleccionar Data/AI" }));
    const detail = screen.getByRole("region", { name: `Evidencias de ${lucia.name}` });
    expect(within(detail).getByText("Machine learning con Python")).toBeInTheDocument();
    expect(screen.getByText("Brecha por área")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Seleccionar Cloud/DevOps" }));
    expect(within(detail).queryByText("Machine learning con Python")).not.toBeInTheDocument();
    expect(within(detail).getByRole("heading", { name: "Cloud/DevOps" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cerrar detalle del área" }));
    expect(screen.queryByRole("region", { name: `Evidencias de ${lucia.name}` })).not.toBeInTheDocument();
    expect(screen.getByText("Brecha por área")).toBeInTheDocument();
  });

  it("no conserva evidencia de Lucía al cambiar al candidato Carlos", () => {
    const { rerender } = render(renderPanel(lucia));
    fireEvent.click(screen.getByRole("button", { name: "Seleccionar Data/AI" }));
    expect(screen.getByText("Machine learning con Python")).toBeInTheDocument();

    rerender(renderPanel(carlos));
    expect(screen.queryByText("Machine learning con Python")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Seleccionar Data/AI" }));
    expect(screen.getByText("Fundamentos de machine learning con Python")).toBeInTheDocument();
    expect(screen.queryByText("Machine learning con Python")).not.toBeInTheDocument();
  });
});
