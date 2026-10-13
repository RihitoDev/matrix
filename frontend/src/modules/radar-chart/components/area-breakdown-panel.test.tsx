import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GLOBAL_AVERAGE } from "../data/area-details.data";
import { RADAR_AREA_SCORES } from "../data/radar-profile.data";
import { AreaBreakdownPanel } from "./area-breakdown-panel";

describe("AreaBreakdownPanel", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ["desarrollo", "Desarrollo", "Experto", "8,5", "85%"],
    ["cloud-devops", "Cloud/DevOps", "Alto", "7,0", "70%"],
    ["data-ai", "Data/AI", "Alto", "6,5", "65%"],
    ["qa", "QA", "Medio", "5,0", "50%"],
    ["ciberseguridad", "Ciberseguridad", "Medio", "4,5", "45%"],
    ["gobernanza-ti", "Gobernanza TI", "Medio", "6,0", "60%"],
  ])("shows the %s area with its level and score", (id, name, level, score, width) => {
    render(<AreaBreakdownPanel areas={RADAR_AREA_SCORES} average={GLOBAL_AVERAGE} />);

    const row = screen.getByTestId(`area-breakdown-${id}`);
    const bar = row.querySelector<HTMLElement>("[style]");

    expect(within(row).getByText(name)).toBeDefined();
    expect(within(row).getByText(level)).toBeDefined();
    expect(within(row).getByText(score)).toBeDefined();
    expect(bar?.style.width).toBe(width);
  });

  it("renders the six areas under the panel title", () => {
    render(<AreaBreakdownPanel areas={RADAR_AREA_SCORES} average={GLOBAL_AVERAGE} />);

    const panel = screen.getByRole("complementary", { name: "Desglose por área" });

    expect(within(panel).getAllByRole("listitem")).toHaveLength(6);
  });

  it("shows the global average with a decimal comma", () => {
    render(<AreaBreakdownPanel areas={RADAR_AREA_SCORES} average={GLOBAL_AVERAGE} />);

    expect(screen.getByText("Media global")).toBeDefined();
    expect(screen.getByText("6,25")).toBeDefined();
  });

  it("clamps the bar of an out of range score", () => {
    render(
      <AreaBreakdownPanel
        areas={[{ id: "qa", name: "QA", score: 12 }]}
        average={GLOBAL_AVERAGE}
      />,
    );

    const bar = screen.getByTestId("area-breakdown-qa").querySelector<HTMLElement>("[style]");

    expect(bar?.style.width).toBe("100%");
  });
});
