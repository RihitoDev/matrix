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

  it("keeps the remove option available for a very long name", async () => {
    const user = userEvent.setup();
    const handleRemove = vi.fn();
    const longName = "a".repeat(300);
    render(<SkillBadge skill={{ id: "skill-1", name: longName }} onRemove={handleRemove} />);

    expect(screen.getByText(longName)).toHaveClass("truncate");
    expect(screen.getByText(longName)).toHaveAttribute("title", longName);

    await user.click(screen.getByRole("button", { name: `Quitar ${longName}` }));

    expect(handleRemove).toHaveBeenCalledWith("skill-1");
  });
});
