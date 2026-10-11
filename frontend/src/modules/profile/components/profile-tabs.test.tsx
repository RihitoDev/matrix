import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProfileTabs } from "./profile-tabs";

describe("ProfileTabs", () => {
  afterEach(() => {
    cleanup();
  });

  it("links the available tabs and marks the active one", () => {
    render(<ProfileTabs activeTab="personal-info" />);

    const personalInfoTab = screen.getByRole("link", { name: "Datos personales" });
    const presentationTab = screen.getByRole("link", { name: "Presentación" });

    expect(personalInfoTab).toHaveAttribute("href", "/profile/personal-info");
    expect(personalInfoTab).toHaveAttribute("aria-current", "page");
    expect(presentationTab).toHaveAttribute("href", "/profile/presentation");
    expect(presentationTab).not.toHaveAttribute("aria-current");
  });

  it("links the documents tab", () => {
    render(<ProfileTabs activeTab="documents" />);

    const documentsTab = screen.getByRole("link", { name: "Documentos" });

    expect(documentsTab).toHaveAttribute("href", "/profile/documents");
    expect(documentsTab).toHaveAttribute("aria-current", "page");
  });

  it("links the trajectory tab to the education section", () => {
    render(<ProfileTabs activeTab="trajectory" />);

    const trajectoryTab = screen.getByRole("link", { name: "Trayectoria" });

    expect(trajectoryTab).toHaveAttribute("href", "/profile/trajectory/education");
    expect(trajectoryTab).toHaveAttribute("aria-current", "page");
  });
});
