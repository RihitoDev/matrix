import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { MentorDirectoryItem } from "../../types/mentor-directory.types";
import { MentorDirectoryGrid } from "./mentor-directory-grid";

const mentors: MentorDirectoryItem[] = [
  {
    id: "0424f370-00f0-43cf-9b8a-997af81840b9",
    fullName: "Mentor Uno",
    headline: "Backend Developer",
    technicalAreas: ["Backend"],
    photoUrl: null,
    education: null,
    isAvailable: false,
    orientationTypes: [],
  },
  {
    id: "0fa5e6de-63a4-430e-87fb-22f5eb700ecd",
    fullName: "Mentor Dos",
    headline: "QA Engineer",
    technicalAreas: ["QA"],
    photoUrl: null,
    education: null,
    isAvailable: false,
    orientationTypes: [],
  },
];

afterEach(cleanup);

describe("MentorDirectoryGrid", () => {
  it("renderiza varios mentores", () => {
    const { container } = render(<MentorDirectoryGrid mentors={mentors} />);

    expect(screen.getByText("Mentor Uno")).toBeDefined();
    expect(screen.getByText("Mentor Dos")).toBeDefined();
    expect(screen.getByRole("region", { name: "Listado de mentores" })).toHaveClass(
      "@container",
      "w-full",
    );
    expect(container.querySelector("section > div")).toHaveClass(
      "grid-cols-1",
      "@min-[50rem]:grid-cols-2",
    );
  });

  it("renderiza un solo mentor", () => {
    render(<MentorDirectoryGrid mentors={[mentors[0]]} />);

    expect(screen.getByText("Mentor Uno")).toBeDefined();
    expect(screen.queryByText("Mentor Dos")).toBeNull();
  });

  it("tolera un arreglo vacío sin renderizar enlaces", () => {
    render(<MentorDirectoryGrid mentors={[]} />);

    expect(screen.queryByRole("link")).toBeNull();
  });
});
