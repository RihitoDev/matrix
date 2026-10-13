import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AreaMetrics } from "./area-metrics";

describe("AreaMetrics", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the score over ten, the level and the global average", () => {
    const { container } = render(
      <AreaMetrics score={8.5} level="Experto" gap={2.3} globalAverage={6.25} />,
    );

    expect(container.textContent).toContain("8,5 / 10");
    expect(screen.getByText("Experto")).toBeDefined();
    expect(screen.getByText("vs. media global 6,25")).toBeDefined();
    expect(screen.getByRole("img", { name: "Media global 6,25" })).toBeDefined();
  });

  it("shows whole scores with one decimal", () => {
    const { container } = render(
      <AreaMetrics score={7} level="Alto" gap={0.8} globalAverage={6.25} />,
    );

    expect(container.textContent).toContain("7,0 / 10");
  });

  it("shows a positive gap with a plus sign and an icon without wrapping", () => {
    render(<AreaMetrics score={8.5} level="Experto" gap={2.3} globalAverage={6.25} />);

    const gap = screen.getByText("+2,3");

    expect(gap.className).toContain("text-ink");
    expect(gap.className).toContain("whitespace-nowrap");
    expect(gap.querySelector("svg.lucide-arrow-up-right")).not.toBeNull();
  });

  it("shows a negative gap with a minus sign and a down icon in the danger color", () => {
    render(<AreaMetrics score={4.5} level="Medio" gap={-1.8} globalAverage={6.25} />);

    const gap = screen.getByText("-1,8");

    expect(gap.className).toContain("text-danger");
    expect(gap.querySelector("svg.lucide-arrow-down-right")).not.toBeNull();
  });

  it("shows a zero gap without a sign or an icon", () => {
    render(<AreaMetrics score={6.25} level="Medio" gap={0} globalAverage={6.25} />);

    const gap = screen.getByText("0,0");

    expect(gap.className).toContain("text-ink");
    expect(gap.querySelector("svg")).toBeNull();
  });

  it("centers the three values on a row of the same minimum height", () => {
    const { container } = render(
      <AreaMetrics score={7} level="Alto" gap={0.8} globalAverage={6.25} />,
    );

    const rows = Array.from(container.querySelectorAll(".min-h-10"));

    expect(rows).toHaveLength(3);
    rows.forEach((row) => {
      expect(row.className).toContain("items-center");
    });
    expect(rows[1].contains(screen.getByText("Alto"))).toBe(true);
    expect(rows[0].contains(screen.getByRole("img", { name: "Media global 6,25" }))).toBe(false);
  });
});
