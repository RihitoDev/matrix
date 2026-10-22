import { renderWithQuery as render } from "@/shared/testing/render-with-query";
import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProfilePageLayout } from "./profile-page-layout";

describe("ProfilePageLayout", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the header, the title, the description, one heading and the content", () => {
    render(
      <ProfilePageLayout
        title="Presentación profesional"
        description="Section description"
      >
        <p>Section content</p>
      </ProfilePageLayout>,
    );

    expect(screen.queryByRole("navigation", { name: "Ubicación en el perfil" })).not.toBeInTheDocument();
    expect(screen.queryByText("Egresado aprobado")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Presentación profesional" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Section description")).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Secciones del perfil" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText("Section content")).toBeInTheDocument();
  });
});
