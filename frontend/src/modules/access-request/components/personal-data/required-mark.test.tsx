import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RequiredMark } from "./required-mark";

describe("RequiredMark", () => {
  afterEach(() => cleanup());

  it("muestra un asterisco decorativo con el token accent", () => {
    const { container } = render(<RequiredMark />);

    const mark = container.querySelector("span");
    expect(mark).toHaveTextContent("*");
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark).toHaveClass("text-accent");
    expect(screen.queryByText("*")).toBeInTheDocument();
  });
});
