import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ReviewDetail } from "../../types/request-review.types";
import { detail } from "./data-contrast-panel.test";
import { HistoryCard } from "./history-card";

const history = (overrides: Partial<ReviewDetail["history"]> = {}): ReviewDetail["history"] => ({
  submittedAt: "2026-09-22T13:14:00.000Z",
  openedAt: "2026-09-22T15:02:00.000Z",
  openedBy: "Carla Montaño",
  reviewedAt: null,
  reviewedBy: null,
  rejectionReason: null,
  ...overrides,
});

const labels = () => screen.getAllByRole("listitem").map((item) => item.textContent);

describe("HistoryCard", () => {
  afterEach(() => cleanup());

  it("sin datos de historial no se muestra", () => {
    const { container } = render(<HistoryCard detail={{ ...detail, history: history({ submittedAt: null, openedAt: null, openedBy: null }) }} />);
    expect(container.firstChild).toBeNull();
  });

  it("en revisión muestra el envío y la apertura con sus fechas en hora de Bolivia, sin duplicar", () => {
    render(<HistoryCard detail={{ ...detail, history: history({ reviewedAt: "2026-09-22T15:02:00.000Z", reviewedBy: "Carla Montaño" }) }} />);

    expect(screen.getByText("Historial de esta solicitud")).toBeInTheDocument();
    expect(labels()).toEqual(["Solicitud enviada por la persona titulada22 sep, 09:14", "Abierta por Carla Montaño22 sep, 11:02"]);
  });

  it.each([
    ["approved", "Aprobada por Bo Revisor"],
    ["rejected", "Rechazada por Bo Revisor"],
  ] as const)("con el estado %s muestra enviada, abierta y %s en orden cronológico", (status, verdict) => {
    render(
      <HistoryCard
        detail={{ ...detail, status, history: history({ reviewedAt: "2026-09-22T18:30:00.000Z", reviewedBy: "Bo Revisor" }) }}
      />,
    );

    expect(labels()).toEqual([
      "Solicitud enviada por la persona titulada22 sep, 09:14",
      "Abierta por Carla Montaño22 sep, 11:02",
      `${verdict}22 sep, 14:30`,
    ]);
  });

  it("una solicitud dictaminada antes de las columnas de apertura muestra solo enviada y dictamen", () => {
    render(
      <HistoryCard
        detail={{
          ...detail,
          status: "approved",
          history: history({ openedAt: null, openedBy: null, reviewedAt: "2026-09-22T18:30:00.000Z", reviewedBy: "Bo Revisor" }),
        }}
      />,
    );

    expect(labels()).toEqual(["Solicitud enviada por la persona titulada22 sep, 09:14", "Aprobada por Bo Revisor22 sep, 14:30"]);
    expect(screen.queryByText(/Abierta/)).toBeNull();
  });

  it("en revisión sin columnas de apertura usa el par de revisión como apertura", () => {
    render(
      <HistoryCard
        detail={{ ...detail, history: history({ openedAt: null, openedBy: null, reviewedAt: "2026-09-22T15:02:00.000Z", reviewedBy: "Carla Montaño" }) }}
      />,
    );

    expect(labels()).toContain("Abierta por Carla Montaño22 sep, 11:02");
  });

  it("si falta el nombre de quien la abrió no deja la entrada vacía", () => {
    render(<HistoryCard detail={{ ...detail, history: history({ openedBy: null }) }} />);
    expect(screen.getByText("Solicitud abierta")).toBeInTheDocument();
  });

  it("no usa 'egresado'", () => {
    render(<HistoryCard detail={{ ...detail, history: history() }} />);
    expect(document.body.textContent?.toLowerCase()).not.toContain("egres");
  });
});
