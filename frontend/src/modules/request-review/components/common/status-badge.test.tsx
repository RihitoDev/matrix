import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ReviewStatus } from "../../types/request-review.types";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  afterEach(() => cleanup());

  it.each([
    ["pending", "Pendiente", ["text-text-secondary"]],
    ["in_review", "En revisión", ["text-ink-soft"]],
    ["approved", "Aprobada", ["text-ink"]],
    ["rejected", "Rechazada", ["text-danger"]],
  ] as Array<[ReviewStatus, string, string[]]>)("%s se muestra con su texto, icono y clases de token", (status, label, classes) => {
    const { container } = render(<StatusBadge status={status} />);

    const badge = screen.getByText(label);
    expect(badge).toHaveClass("font-semibold", ...classes);
    expect(container.querySelector("svg[aria-hidden='true']")).not.toBeNull();
  });

  it("el estado sigue siendo legible por su texto para lectores de pantalla", () => {
    render(<StatusBadge status="in_review" />);
    expect(screen.getByText("En revisión")).toBeVisible();
  });

  it("no usa colores de semáforo ni hex", () => {
    const { container } = render(
      <>
        <StatusBadge status="pending" />
        <StatusBadge status="approved" />
        <StatusBadge status="rejected" />
      </>,
    );
    expect(container.innerHTML).not.toMatch(/(green|amber|yellow|red)-\d|#[0-9a-fA-F]{6}/);
  });

  it("un estado desconocido muestra su valor sin icono", () => {
    const { container } = render(<StatusBadge status={"otro" as ReviewStatus} />);
    expect(screen.getByText("otro")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeNull();
  });
});
