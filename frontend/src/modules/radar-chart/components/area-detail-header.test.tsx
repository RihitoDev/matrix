import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AreaDetailHeader } from "./area-detail-header";

describe("AreaDetailHeader", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the label, the area name as a level 2 heading and the subtitle", () => {
    render(<AreaDetailHeader titleId="area-title" name="Desarrollo" order={1} onClose={vi.fn()} />);

    const heading = screen.getByRole("heading", { level: 2, name: "Desarrollo" });

    expect(heading.getAttribute("id")).toBe("area-title");
    expect(screen.getByText("Área de afinidad")).toBeDefined();
    expect(screen.getByText("Información relevante del candidato seleccionado")).toBeDefined();
  });

  it("shows the order number of the area", () => {
    render(<AreaDetailHeader titleId="area-title" name="QA" order={4} onClose={vi.fn()} />);

    expect(screen.getByText("4")).toBeDefined();
  });

  it("stays visible at the top of the panel", () => {
    render(<AreaDetailHeader titleId="area-title" name="Desarrollo" order={1} onClose={vi.fn()} />);

    const header = screen.getByRole("banner");

    expect(header.className).toContain("sticky");
    expect(header.className).toContain("top-0");
  });

  it("calls onClose once when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<AreaDetailHeader titleId="area-title" name="Desarrollo" order={1} onClose={onClose} />);

    const closeButton = screen.getByRole("button", { name: "Cerrar detalle del área" });
    fireEvent.click(closeButton);

    expect(closeButton.getAttribute("type")).toBe("button");
    expect(closeButton.className).toContain("focus-visible:ring-2");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
