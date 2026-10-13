import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AreaLevelBadge } from "./area-level-badge";

describe("AreaLevelBadge", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ["Bajo", "bg-surface-soft", "bg-border-strong"],
    ["Medio", "bg-gold/10", "bg-gold"],
    ["Alto", "bg-ink", "bg-surface"],
    ["Experto", "bg-accent", "bg-surface"],
  ] as const)("styles the %s level with brand colors and a dot", (level, badgeClass, dotClass) => {
    render(<AreaLevelBadge level={level} />);

    const badge = screen.getByText(level);
    const dot = badge.querySelector("span");

    expect(badge.className.split(" ")).toContain(badgeClass);
    expect(dot?.className.split(" ")).toContain(dotClass);
    expect(dot?.getAttribute("aria-hidden")).toBe("true");
  });

  it("uses dark text on the gold badge to keep enough contrast", () => {
    render(<AreaLevelBadge level="Medio" />);

    const badge = screen.getByText("Medio");

    expect(badge.className).toContain("color-mix");
    expect(badge.className).not.toContain("text-surface");
  });
});
