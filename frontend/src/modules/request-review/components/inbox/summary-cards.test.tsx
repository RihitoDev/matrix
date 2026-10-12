import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { InboxSummary } from "../../types/inbox-summary.types";
import { SummaryCards } from "./summary-cards";

const SUMMARY: InboxSummary = {
  pendingCount: 18,
  pendingOver24hCount: 5,
  decidedTodayCount: 7,
  approvedTodayCount: 6,
  rejectedTodayCount: 1,
  averageReviewHours: 21,
  reviewTimeGoalHours: 48,
  rejectedThisMonthCount: 5,
  topRejectionReason: null,
};

const show = (summary: InboxSummary | null, extra: Partial<Parameters<typeof SummaryCards>[0]> = {}) =>
  render(<SummaryCards summary={summary} isLoading={false} error={null} onRetry={vi.fn()} {...extra} />);

describe("SummaryCards", () => {
  afterEach(() => cleanup());

  it("muestra las cuatro tarjetas con sus números y líneas secundarias", () => {
    show(SUMMARY);

    expect(screen.getByText("Pendientes de dictamen").nextElementSibling).toHaveTextContent("18");
    expect(screen.getByText("5 llevan más de 24 h")).toBeInTheDocument();
    expect(screen.getByText("Dictaminadas hoy").nextElementSibling).toHaveTextContent("7");
    expect(screen.getByText("6 aprobadas, 1 rechazada")).toBeInTheDocument();
    expect(screen.getByText("Tiempo medio de dictamen").nextElementSibling).toHaveTextContent("21 h");
    expect(screen.getByText("Meta: menos de 48 h")).toBeInTheDocument();
    expect(screen.getByText("Rechazadas este mes").nextElementSibling).toHaveTextContent("5");
  });

  it("sin motivo principal no muestra esa línea; con motivo la muestra", () => {
    const { unmount } = show(SUMMARY);
    expect(screen.queryByText(/Motivo principal/)).toBeNull();
    unmount();

    show({ ...SUMMARY, topRejectionReason: "documento ilegible" });
    expect(screen.getByText("Motivo principal: documento ilegible")).toBeInTheDocument();
  });

  it("sin tiempo medio muestra Sin datos", () => {
    show({ ...SUMMARY, averageReviewHours: null });
    expect(screen.getByText("Sin datos")).toBeInTheDocument();
  });

  it("usa el singular y el cero en las líneas secundarias", () => {
    show({ ...SUMMARY, pendingOver24hCount: 1, approvedTodayCount: 1, rejectedTodayCount: 0 });
    expect(screen.getByText("1 lleva más de 24 h")).toBeInTheDocument();
    expect(screen.getByText("1 aprobada, 0 rechazadas")).toBeInTheDocument();
  });

  it("ninguna pendiente con más de 24 h", () => {
    show({ ...SUMMARY, pendingOver24hCount: 0 });
    expect(screen.getByText("Ninguna lleva más de 24 h")).toBeInTheDocument();
  });

  it("mientras carga muestra el esqueleto y ningún número", () => {
    show(null, { isLoading: true });
    expect(screen.getByTestId("summary-skeleton")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText("Pendientes de dictamen")).toBeNull();
  });

  it("con error muestra el mensaje y Reintentar lo vuelve a pedir", () => {
    const onRetry = vi.fn();
    show(null, { error: "No se pudo conectar con el servidor.", onRetry });

    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo conectar con el servidor.");
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("sin datos ni error muestra un mensaje genérico", () => {
    show(null);
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo cargar el resumen de la bandeja.");
  });
});
