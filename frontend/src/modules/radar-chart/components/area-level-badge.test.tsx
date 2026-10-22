import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AreaLevelBadge } from "./area-level-badge";

describe("AreaLevelBadge", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ["Bajo", "text-text-secondary", "bg-border-strong"],
    ["Medio", "text-ink-soft", "bg-ink-soft"],
    ["Alto", "text-ink", "bg-ink-soft"],
    ["Experto", "text-ink", "bg-ink"],
  ] as const)("styles the %s level with neutral text and a dot", (level, badgeClass, dotClass) => {
    render(<AreaLevelBadge level={level} />);

    const badge = screen.getByText(level);
    const dot = badge.querySelector("span");

    expect(badge.className.split(" ")).toContain(badgeClass);
    expect(dot?.className.split(" ")).toContain(dotClass);
    expect(dot?.getAttribute("aria-hidden")).toBe("true");
  });

  it("uses ink text without a colored background", () => {
    render(<AreaLevelBadge level="Medio" />);

    const badge = screen.getByText("Medio");

    expect(badge.className).toContain("text-ink-soft");
    expect(badge.className).not.toContain("text-surface");
  });
});
