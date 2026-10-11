import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { detail } from "./data-contrast-panel.test";
import { HistoryCard } from "./history-card";

describe("HistoryCard", () => {
  afterEach(() => cleanup());

  it("sin datos de historial no se muestra", () => {
    const { container } = render(<HistoryCard detail={detail} />);
    expect(container.firstChild).toBeNull();
  });

  it("muestra el envío y quién abrió la solicitud con sus fechas en hora de Bolivia", () => {
    render(
      <HistoryCard
        detail={{
          ...detail,
          history: { submittedAt: "2026-09-22T13:14:00.000Z", reviewedAt: "2026-09-22T15:02:00.000Z", reviewedBy: "Carla Montaño", rejectionReason: null },
        }}
      />,
    );

    expect(screen.getByText("Historial de esta solicitud")).toBeInTheDocument();
    expect(screen.getByText("Solicitud enviada por la persona titulada")).toBeInTheDocument();
    expect(screen.getByText("22 sep, 09:14")).toBeInTheDocument();
    expect(screen.getByText("Abierta por Carla Montaño")).toBeInTheDocument();
    expect(screen.getByText("22 sep, 11:02")).toBeInTheDocument();
  });

  it.each([
    ["approved", "Aprobada por Carla Montaño"],
    ["rejected", "Rechazada por Carla Montaño"],
  ] as const)("con el estado %s el revisor figura como %s", (status, text) => {
    render(
      <HistoryCard
        detail={{ ...detail, status, history: { submittedAt: null, reviewedAt: "2026-09-22T15:02:00.000Z", reviewedBy: "Carla Montaño", rejectionReason: null } }}
      />,
    );
    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.queryByText("Solicitud enviada por la persona titulada")).toBeNull();
  });

  it("no usa 'egresado'", () => {
    render(<HistoryCard detail={{ ...detail, history: { submittedAt: "2026-09-22T13:14:00.000Z", reviewedAt: null, reviewedBy: null, rejectionReason: null } }} />);
    expect(document.body.textContent?.toLowerCase()).not.toContain("egres");
  });
});
