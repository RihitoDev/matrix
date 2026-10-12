import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { WorkExperienceItem } from "../types/work-experience-item.types";
import { WorkExperienceListCard } from "./work-experience-list-card";

const LONG_POSITION = "a".repeat(1200);

const EXPERIENCE: WorkExperienceItem = {
  id: "experience-1",
  companyName: "Banco",
  position: LONG_POSITION,
  startDate: "2020-02-01",
  endDate: "2023-07-01",
  isCurrent: false,
  description: null,
};

describe("WorkExperienceListCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("wraps a long position inside the card and keeps its actions available", () => {
    render(<WorkExperienceListCard experiences={[EXPERIENCE]} />);

    const heading = screen.getByRole("heading", { name: LONG_POSITION });
    expect(heading).toHaveClass("[overflow-wrap:anywhere]");
    expect(heading.parentElement).toHaveClass("min-w-0", "flex-1");
    expect(screen.getByRole("button", { name: `Editar ${LONG_POSITION}` })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `Eliminar ${LONG_POSITION}` })).toBeInTheDocument();
  });
});
