import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SkillBadge } from "./skill-badge";

describe("SkillBadge", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the skill name and removes it by id", async () => {
    const user = userEvent.setup();
    const handleRemove = vi.fn();
    render(<SkillBadge skill={{ id: "skill-1", name: "SQL" }} onRemove={handleRemove} />);

    expect(screen.getByText("SQL")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Quitar SQL" }));

    expect(handleRemove).toHaveBeenCalledWith("skill-1");
  });
});
