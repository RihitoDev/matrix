import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RADAR_KPIS } from "../data/radar-profile.data";
import { KpiCards } from "./kpi-cards";

function getCard(title: string): HTMLElement {
  const card = screen.getByText(title).closest("li");

  if (!card) throw new Error(`Card "${title}" not found`);

  return card;
}

describe("KpiCards", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the four summary cards", () => {
    render(<KpiCards kpis={RADAR_KPIS} />);

    const list = screen.getByRole("list", { name: "Resumen del perfil" });

    expect(within(list).getAllByRole("listitem")).toHaveLength(4);
  });

  it("shows the global affinity with its variation", () => {
    render(<KpiCards kpis={RADAR_KPIS} />);

    const card = within(getCard("Afinidad global"));

    expect(card.getByText("6,25")).toBeDefined();
    expect(card.getByText("/ 10")).toBeDefined();
    expect(card.getByText("+0,8 vs. anterior")).toBeDefined();
  });

  it("marks a negative variation as a drop", () => {
    render(<KpiCards kpis={{ ...RADAR_KPIS, variationVsPrevious: -0.5 }} />);

    const variation = within(getCard("Afinidad global")).getByText("-0,5 vs. anterior");

    expect(variation.className.split(" ")).toContain("text-danger");
  });

  it("shows no trend arrow when there is no variation", () => {
    render(<KpiCards kpis={{ ...RADAR_KPIS, variationVsPrevious: 0 }} />);

    const variation = within(getCard("Afinidad global")).getByText("0,0 vs. anterior");

    expect(variation.querySelector("svg")).toBeNull();
  });

  it("shows the key areas", () => {
    render(<KpiCards kpis={RADAR_KPIS} />);

    const card = within(getCard("Áreas clave"));

    expect(card.getByText("6")).toBeDefined();
    expect(card.getByText("Cobertura completa")).toBeDefined();
  });

  it("shows the keywords total and the high relevance ones", () => {
    render(<KpiCards kpis={RADAR_KPIS} />);

    const card = within(getCard("Palabras clave"));

    expect(card.getByText("142")).toBeDefined();
    expect(card.getByText("37 alta relevancia")).toBeDefined();
  });

  it("shows the target profile with its minimum threshold", () => {
    render(<KpiCards kpis={RADAR_KPIS} />);

    const card = within(getCard("Perfil objetivo"));

    expect(card.getByText("73%")).toBeDefined();
    expect(card.getByText("Compatibilidad · Umbral mín. 60%")).toBeDefined();
  });
});
