import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AreaScoreBar } from "./area-score-bar";

describe("AreaScoreBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("fills the bar up to the score and marks the global average", () => {
    render(<AreaScoreBar score={8.5} globalAverage={6.25} />);

    const marker = screen.getByRole("img", { name: "Media global 6,25" });

    expect(screen.getByTestId("area-score-fill").style.width).toBe("85%");
    expect(marker.style.left).toBe("62.5%");
    expect(marker.getAttribute("title")).toBe("Media global 6,25");
  });

  it("keeps the fill inside the bar for out of range scores", () => {
    const { rerender } = render(<AreaScoreBar score={12} globalAverage={6.25} />);

    expect(screen.getByTestId("area-score-fill").style.width).toBe("100%");

    rerender(<AreaScoreBar score={-1} globalAverage={6.25} />);

    expect(screen.getByTestId("area-score-fill").style.width).toBe("0%");
  });
});
