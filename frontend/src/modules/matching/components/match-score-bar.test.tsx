import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MatchScoreBar } from "./match-score-bar";

describe("MatchScoreBar", () => {
  afterEach(cleanup);

  it.each([[0, 0], [49.8, 50], [100, 100], [125, 100], [-10, 0], [NaN, 0], [Infinity, 0]])(
    "renders score %s as %s through the UI progress component",
    (score, expected) => {
      render(<MatchScoreBar score={score} />);
      const progress = screen.getByRole("progressbar", { name: "Compatibilidad" });
      expect(progress).toHaveAttribute("aria-valuenow", String(expected));
      expect(progress).toHaveAttribute("data-slot", "progress");
      expect(screen.getByText(`${expected}%`)).toBeInTheDocument();
    },
  );

  it("keeps an accessible name when the visible label is hidden", () => {
    render(<MatchScoreBar score={60} showLabel={false} />);
    expect(screen.queryByText("Compatibilidad")).not.toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Compatibilidad" })).toHaveAttribute("aria-valuenow", "60");
  });
});
