import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AreaEmptyState } from "./area-empty-state";

describe("AreaEmptyState", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the empty message in italics with a decorative icon", () => {
    render(<AreaEmptyState />);

    const message = screen.getByText("Sin información registrada");

    expect(message.className).toContain("italic");
    expect(message.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });
});
