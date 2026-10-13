import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AreaExperienceTimeline } from "./area-experience-timeline";

const experience = [
  {
    id: "exp-1",
    role: "Ingeniero DevOps",
    company: "Andes Digital",
    durationYears: 1.5,
    description: "Automatización de la infraestructura con Terraform",
  },
  { id: "exp-2", role: "Desarrollador Full Stack", company: "NovaTech", durationYears: 2 },
  { id: "exp-3", role: "Administrador de sistemas", company: "Cooperativa", durationYears: 1 },
];

describe("AreaExperienceTimeline", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders every experience with its role, company and description", () => {
    render(<AreaExperienceTimeline experience={experience} />);

    const items = within(screen.getByRole("list", { name: "Experiencia" })).getAllByRole("listitem");

    expect(items).toHaveLength(3);
    expect(within(items[0]).getByText("Ingeniero DevOps")).toBeDefined();
    expect(within(items[0]).getByText("Andes Digital")).toBeDefined();
    expect(
      within(items[0]).getByText("Automatización de la infraestructura con Terraform"),
    ).toBeDefined();
    expect(within(items[1]).getByText("NovaTech")).toBeDefined();
  });

  it("shows the duration in a pill that never wraps", () => {
    render(<AreaExperienceTimeline experience={experience} />);

    ["1,5 años", "2 años", "1 año"].forEach((duration) => {
      expect(screen.getByText(duration).className).toContain("whitespace-nowrap");
    });
  });

  it("connects every item except the last one", () => {
    render(<AreaExperienceTimeline experience={experience} />);

    const items = screen.getAllByRole("listitem");

    expect(screen.getAllByTestId("experience-connector")).toHaveLength(2);
    expect(within(items[2]).queryByTestId("experience-connector")).toBeNull();
  });

  it("shows the empty message when there is no experience", () => {
    render(<AreaExperienceTimeline experience={[]} />);

    expect(screen.getByText("Sin información registrada")).toBeDefined();
    expect(screen.queryByRole("list")).toBeNull();
  });
});
