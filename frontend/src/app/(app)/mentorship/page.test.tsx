import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithQuery } from "@/shared/testing/render-with-query";
import MentorshipPage from "./page";

describe("MentorshipPage", () => {
  it("renderiza la vista de mentoría", () => {
    renderWithQuery(<MentorshipPage />);

    expect(screen.getByText("Participa como mentor")).toBeDefined();

    expect(
      screen.getByRole("heading", {
        name: "Participación",
      }),
    ).toBeDefined();

    expect(
      screen.getByText("Quiero participar como mentor"),
    ).toBeDefined();
  });
});
