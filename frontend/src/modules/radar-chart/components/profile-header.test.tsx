import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RADAR_PROFILE } from "../data/radar-profile.data";
import { ProfileHeader } from "./profile-header";

describe("ProfileHeader", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the name, title and years of experience", () => {
    render(<ProfileHeader profile={RADAR_PROFILE} />);

    expect(screen.getByRole("heading", { level: 1, name: "Carlos Mendoza Ríos" })).toBeDefined();
    expect(screen.getByText("Senior Software Engineer · 8 años de experiencia")).toBeDefined();
    expect(screen.getByText("Análisis de perfil profesional con IA")).toBeDefined();
  });

  it("lists every technology", () => {
    render(<ProfileHeader profile={RADAR_PROFILE} />);

    const technologies = within(screen.getByRole("list", { name: "Tecnologías" }));

    expect(technologies.getAllByRole("listitem")).toHaveLength(RADAR_PROFILE.technologies.length);
    RADAR_PROFILE.technologies.forEach((technology) => {
      expect(technologies.getByText(technology)).toBeDefined();
    });
  });

  it("shows the profile photo", () => {
    render(<ProfileHeader profile={RADAR_PROFILE} />);

    const photo = screen.getByRole("img", { name: "Carlos Mendoza Ríos" });

    expect(photo.tagName).toBe("IMG");
    expect(photo.getAttribute("src")).toContain("carlos.jpg");
  });

  it("falls back to the initials when the photo fails to load", () => {
    render(<ProfileHeader profile={RADAR_PROFILE} />);

    fireEvent.error(screen.getByRole("img", { name: "Carlos Mendoza Ríos" }));

    const fallback = screen.getByRole("img", { name: "Carlos Mendoza Ríos" });
    expect(fallback.tagName).toBe("SPAN");
    expect(fallback.textContent).toBe("CM");
  });
});
