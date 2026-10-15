import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AFFINITY_AXES } from "../data/matching.data";
import { getCandidatesForVacancy, getVacancyById } from "../services/matching.service";
import { GapBreakdownList } from "./gap-breakdown-list";
import { CandidateList } from "./candidate-list";
import { CandidateDetailPanel } from "./candidate-detail-panel";
import { RadarChart } from "./radar-chart";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  RadarChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PolarAngleAxis: ({ tick }: { tick: (props: { x: number; y: number; textAnchor: string; verticalAnchor: string; index: number }) => ReactNode }) => (
    <svg>{AFFINITY_AXES.map((axis, index) => (
      <g key={axis.id}>
        {tick({ x: 50, y: 50, textAnchor: "middle", verticalAnchor: "middle", index })}
      </g>
    ))}</svg>
  ),
  PolarGrid: () => null,
  PolarRadiusAxis: () => null,
  Radar: () => null,
  Tooltip: () => null,
  Text: () => null,
}));

afterEach(() => cleanup());

const noop = () => undefined;
const target = getVacancyById("vac-tech-lead")!;
const lucia = getCandidatesForVacancy("vac-tech-lead").find((c) => c.id === "cand-lucia-flores")!;
const mariana = getCandidatesForVacancy("vac-tech-lead").find((c) => c.id === "cand-mariana-gutierrez")!;

function Panel({ candidate = lucia }: { candidate?: typeof lucia }) {
  return (
    <CandidateDetailPanel
      candidate={candidate}
      vacancy={target}
      axes={AFFINITY_AXES}
      pendingDiscardId={null}
      onRequestDiscard={noop}
      onConfirmDiscard={noop}
      onCancelDiscard={noop}
      onConfirmSchedule={noop}
      actionFeedback={null}
    />
  );
}

describe("QA HU3 y conexión HU4", () => {
  it("fija el inicio de las seis barras usando tres columnas de grid", () => {
    const { container } = render(<GapBreakdownList axes={AFFINITY_AXES} gaps={lucia.gaps} />);
    const rows = Array.from(container.querySelectorAll("li"));
    expect(rows).toHaveLength(6);
    rows.forEach((row) => {
      expect(row.className).toContain("grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)_3rem]");
    });
  });

  it("muestra solo Buscar candidato como guía del buscador", () => {
    render(
      <CandidateList query="" onQueryChange={noop} candidates={[lucia]} selectedCandidateId={lucia.id} onSelectCandidate={noop} />,
    );
    expect(screen.getByRole("searchbox", { name: "Buscar candidato" })).toHaveAttribute("placeholder", "Buscar candidato");
  });

  it("siempre muestra Perfil objetivo antes del nombre sin ordenar alfabéticamente", () => {
    render(
      <RadarChart axes={AFFINITY_AXES} series={[
        { id: "candidate", name: "Lucía Flores Mamani", color: "red", values: lucia.scores },
        { id: "target", name: "Perfil objetivo", color: "black", values: target.targetProfile },
      ]} />,
    );
    const legend = screen.getByRole("list", { name: "Leyenda del radar comparativo" });
    const entries = within(legend).getAllByRole("listitem");
    expect(entries.map((entry) => entry.textContent)).toEqual(["Perfil objetivo", "Lucía Flores Mamani"]);
  });

  it("selecciona un eje del radar tanto con ratón como con teclado", () => {
    const onAxisSelect = vi.fn();
    render(<RadarChart axes={AFFINITY_AXES} series={[
      { id: "candidate", name: lucia.name, color: "red", values: lucia.scores },
      { id: "target", name: "Perfil objetivo", color: "black", values: target.targetProfile },
    ]} onAxisSelect={onAxisSelect} />);
    const axis = screen.getByRole("button", { name: "Ver detalle de QA" });
    fireEvent.click(axis);
    fireEvent.keyDown(axis, { key: "Enter" });
    expect(onAxisSelect).toHaveBeenNthCalledWith(1, "qa");
    expect(onAxisSelect).toHaveBeenNthCalledWith(2, "qa");
  });

  it("muestra teléfono numérico y los tres botones con la misma variante", () => {
    render(<Panel candidate={mariana} />);
    fireEvent.click(screen.getByRole("button", { name: "Contactar candidato" }));
    expect(screen.getByLabelText("Teléfono de demostración").textContent).toBe(mariana.demoPhone);
    const actions = ["Contactar candidato", "Agendar entrevista", "Descartar perfil"].map(
      (name) => screen.getByRole("button", { name }),
    );
    actions.forEach((button) => expect(button.className).toBe(actions[0].className));
  });

});
