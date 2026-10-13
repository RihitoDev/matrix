import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AreaTags } from "./area-tags";

describe("AreaTags", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders every tag as a chip that cannot overflow its column", () => {
    render(<AreaTags tags={["React", "Node.js", "Inglés B2"]} />);

    const chips = within(screen.getByRole("list", { name: "Etiquetas" })).getAllByRole("listitem");

    expect(chips.map((chip) => chip.textContent)).toEqual(["React", "Node.js", "Inglés B2"]);
    chips.forEach((chip) => {
      expect(chip.className).toContain("max-w-full");
      expect(chip.className).toContain("break-words");
    });
  });

  it("shows the empty message when there are no tags", () => {
    render(<AreaTags tags={[]} />);

    expect(screen.getByText("Sin información registrada")).toBeDefined();
    expect(screen.queryByRole("list")).toBeNull();
  });
});
