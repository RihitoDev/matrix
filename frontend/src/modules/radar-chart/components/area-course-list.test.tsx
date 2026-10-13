import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AreaCourseList } from "./area-course-list";

const courses = [
  { id: "course-1", name: "Arquitectura de software avanzada", institution: "Platzi", year: 2024 },
  { id: "course-2", name: "React y TypeScript profesional", institution: "Udemy", year: 2023 },
];

describe("AreaCourseList", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders every course with its institution and year", () => {
    render(<AreaCourseList courses={courses} />);

    const items = within(screen.getByRole("list", { name: "Cursos" })).getAllByRole("listitem");

    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText("Arquitectura de software avanzada")).toBeDefined();
    expect(within(items[0]).getByText("Platzi")).toBeDefined();
    expect(within(items[0]).getByText("2024")).toBeDefined();
    expect(within(items[1]).getByText("Udemy")).toBeDefined();
    expect(within(items[1]).getByText("2023")).toBeDefined();
  });

  it("shows the subtitle and the empty message when there are no courses", () => {
    render(<AreaCourseList courses={[]} />);

    expect(screen.getByText("Cursos")).toBeDefined();
    expect(screen.getByText("Sin información registrada")).toBeDefined();
    expect(screen.queryByRole("list")).toBeNull();
  });
});
