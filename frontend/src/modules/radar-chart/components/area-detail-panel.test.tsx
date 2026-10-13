import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AREA_DETAILS } from "../data/area-details.data";
import type { AreaDetail } from "../types/area-detail.types";
import { AreaDetailPanel } from "./area-detail-panel";

const desarrollo = AREA_DETAILS.desarrollo;
const ciberseguridad = AREA_DETAILS.ciberseguridad;

describe("AreaDetailPanel", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the area name as a level 2 heading that labels the panel", () => {
    render(<AreaDetailPanel area={desarrollo} onClose={vi.fn()} />);

    const heading = screen.getByRole("heading", { level: 2, name: "Desarrollo" });
    const panel = screen.getByRole("region", { name: "Desarrollo" });

    expect(panel.getAttribute("aria-labelledby")).toBe(heading.getAttribute("id"));
  });

  it("changes the title when another area is rendered", () => {
    const { rerender } = render(<AreaDetailPanel area={desarrollo} onClose={vi.fn()} />);

    rerender(<AreaDetailPanel area={ciberseguridad} onClose={vi.fn()} />);

    expect(screen.getByRole("heading", { level: 2, name: "Ciberseguridad" })).toBeDefined();
    expect(screen.queryByRole("heading", { level: 2, name: "Desarrollo" })).toBeNull();
  });

  it("calls onClose exactly once when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<AreaDetailPanel area={desarrollo} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Cerrar detalle del área" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows the section titles as level 3 headings", () => {
    render(<AreaDetailPanel area={desarrollo} onClose={vi.fn()} />);

    expect(screen.getByRole("heading", { level: 3, name: "Cursos y certificaciones" })).toBeDefined();
    expect(screen.getByRole("heading", { level: 3, name: "Experiencia" })).toBeDefined();
    expect(screen.getByRole("heading", { level: 3, name: "Otros" })).toBeDefined();
  });

  it("keeps courses and certifications in separate lists", () => {
    render(<AreaDetailPanel area={desarrollo} onClose={vi.fn()} />);

    const courses = within(screen.getByRole("list", { name: "Cursos" }));
    const certifications = within(screen.getByRole("list", { name: "Certificaciones" }));

    desarrollo.courses.forEach((course) => {
      expect(courses.getByText(course.name)).toBeDefined();
      expect(certifications.queryByText(course.name)).toBeNull();
    });
    desarrollo.certifications.forEach((certification) => {
      expect(certifications.getByText(certification.name)).toBeDefined();
      expect(courses.queryByText(certification.name)).toBeNull();
    });
    expect(courses.getByText("Platzi")).toBeDefined();
    expect(courses.getByText("2024")).toBeDefined();
    expect(certifications.getByText("Amazon Web Services · 2023")).toBeDefined();
  });

  it("shows every experience with its company, duration and description", () => {
    render(<AreaDetailPanel area={desarrollo} onClose={vi.fn()} />);

    const experience = within(screen.getByRole("list", { name: "Experiencia" }));

    expect(experience.getAllByRole("listitem")).toHaveLength(desarrollo.experience.length);
    expect(experience.getByText("Ingeniero de software sénior")).toBeDefined();
    expect(experience.getByText("Desarrollador Full Stack")).toBeDefined();
    const [first, second] = experience.getAllByRole("listitem");

    expect(within(first).getByText("NovaTech")).toBeDefined();
    expect(within(first).getByText("3 años")).toBeDefined();
    expect(within(second).getByText("Andes Digital")).toBeDefined();
    expect(within(second).getByText("2 años")).toBeDefined();
    expect(experience.getByText(/Diseño e implementación de microservicios/)).toBeDefined();
  });

  it("uses the singular for a one year experience", () => {
    render(<AreaDetailPanel area={ciberseguridad} onClose={vi.fn()} />);

    expect(screen.getByText("1 año")).toBeDefined();
  });

  it("keeps the duration on one line and shows decimals with a comma", () => {
    render(<AreaDetailPanel area={AREA_DETAILS["cloud-devops"]} onClose={vi.fn()} />);

    const experience = within(screen.getByRole("list", { name: "Experiencia" }));
    const duration = experience.getByText("1,5 años");

    expect(duration.className).toContain("whitespace-nowrap");
    expect(experience.getByText("2 años").className).toContain("whitespace-nowrap");
    expect(within(duration.parentElement as HTMLElement).getByText("Andes Digital")).toBeDefined();
  });

  it("shows the score, level and positive gap of Desarrollo", () => {
    render(<AreaDetailPanel area={desarrollo} onClose={vi.fn()} />);

    const panel = screen.getByRole("region", { name: "Desarrollo" });

    expect(panel.textContent).toContain("8,5 / 10");
    expect(screen.getByText("Experto")).toBeDefined();
    expect(screen.getByText("+2,3")).toBeDefined();
    expect(screen.getByText("vs. media global 6,25")).toBeDefined();
  });

  it("shows the score, level and negative gap of Ciberseguridad", () => {
    render(<AreaDetailPanel area={ciberseguridad} onClose={vi.fn()} />);

    const panel = screen.getByRole("region", { name: "Ciberseguridad" });

    expect(panel.textContent).toContain("4,5 / 10");
    expect(screen.getByText("Medio")).toBeDefined();
    expect(screen.getByText("-1,8")).toBeDefined();
  });

  it("shows every tag", () => {
    render(<AreaDetailPanel area={desarrollo} onClose={vi.fn()} />);

    const tags = within(screen.getByRole("list", { name: "Etiquetas" }));

    desarrollo.tags.forEach((tag) => {
      expect(tags.getByText(tag)).toBeDefined();
    });
  });

  it("shows the empty message in every section without information", () => {
    const emptyArea: AreaDetail = {
      ...desarrollo,
      courses: [],
      certifications: [],
      experience: [],
      tags: [],
    };
    render(<AreaDetailPanel area={emptyArea} onClose={vi.fn()} />);

    expect(screen.getAllByText("Sin información registrada")).toHaveLength(4);
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("shows the order number of the area and the item counters", () => {
    render(<AreaDetailPanel area={AREA_DETAILS["cloud-devops"]} onClose={vi.fn()} />);

    const panel = within(screen.getByRole("region", { name: "Cloud/DevOps" }));

    expect(panel.getByText("2")).toBeDefined();
    expect(panel.getByText("7")).toBeDefined();
    expect(panel.getByText("3")).toBeDefined();
    expect(panel.getByText("6")).toBeDefined();
  });

  it("marks the global average on the score bar", () => {
    render(<AreaDetailPanel area={desarrollo} onClose={vi.fn()} />);

    expect(screen.getByRole("img", { name: "Media global 6,25" })).toBeDefined();
  });

  it("animates only when motion is allowed and scrolls only the body", () => {
    render(<AreaDetailPanel area={desarrollo} onClose={vi.fn()} />);

    const panel = screen.getByRole("region", { name: "Desarrollo" });
    const body = screen.getByRole("heading", { level: 3, name: "Otros" }).closest(".overflow-y-auto");

    expect(panel.className).toContain("motion-safe:animate-in");
    expect(panel.className).not.toMatch(/(^| )animate-in/);
    expect(body?.className).toContain("max-h-[60vh]");
    expect(body?.contains(screen.getByRole("button", { name: "Cerrar detalle del área" }))).toBe(false);
  });

  it("applies a custom className", () => {
    render(<AreaDetailPanel area={desarrollo} onClose={vi.fn()} className="custom-panel" />);

    expect(screen.getByRole("region", { name: "Desarrollo" }).className).toContain("custom-panel");
  });
});
