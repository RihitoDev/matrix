import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProfilePageLayout } from "./profile-page-layout";

describe("ProfilePageLayout", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the header, the title, the description, the tabs and the content", () => {
    render(
      <ProfilePageLayout
        activeTab="presentation"
        title="Presentación profesional"
        description="Section description"
      >
        <p>Section content</p>
      </ProfilePageLayout>,
    );

    expect(screen.getByText("Comunidad / Mi perfil")).toBeInTheDocument();
    expect(screen.getByText("Egresado aprobado")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Presentación profesional" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Section description")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Secciones del perfil" })).toBeInTheDocument();
    expect(screen.getByText("Section content")).toBeInTheDocument();
  });
});
