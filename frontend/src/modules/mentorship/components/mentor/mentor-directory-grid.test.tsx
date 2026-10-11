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
  },
  {
    id: "0fa5e6de-63a4-430e-87fb-22f5eb700ecd",
    fullName: "Mentor Dos",
    headline: "QA Engineer",
    technicalAreas: ["QA"],
  },
];

afterEach(cleanup);

describe("MentorDirectoryGrid", () => {
  it("renderiza varios mentores", () => {
    render(<MentorDirectoryGrid mentors={mentors} />);

    expect(screen.getByText("Mentor Uno")).toBeDefined();
    expect(screen.getByText("Mentor Dos")).toBeDefined();
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
