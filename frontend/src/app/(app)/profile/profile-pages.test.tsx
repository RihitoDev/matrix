import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DocumentsPage from "./documents/page";
import ProfilePage from "./page";
import PersonalInfoPage from "./personal-info/page";
import PresentationPage from "./presentation/page";
import CertificationsPage from "./trajectory/certifications/page";
import EducationPage from "./trajectory/education/page";
import SkillsPage from "./trajectory/skills/page";

import WorkExperiencePage from "./trajectory/experience/page";

vi.mock("@/modules/profile", () => ({
  PersonalInfoView: () => <p>personal-info-view</p>,
  PresentationView: () => <p>presentation-view</p>,
  ProfileOverviewView: () => <p>profile-overview-view</p>,
}));

vi.mock("@/modules/skills", () => ({
  SkillsView: () => <p>skills-view</p>,
}));

vi.mock("@/modules/education", () => ({
  EducationView: () => <p>education-view</p>,
}));

vi.mock("@/modules/certifications", () => ({
  CertificationsView: () => <p>certifications-view</p>,
}));

vi.mock("@/modules/documents", () => ({
  DocumentsCvView: () => <p>documents-cv-view</p>,
}));

vi.mock("@/modules/work-experience", () => ({
  WorkExperienceView: () => <p>work-experience-view</p>,
}));

describe("profile pages", () => {
  afterEach(() => {
    cleanup();
  });

  it("mounts the skills view", () => {
    render(<SkillsPage />);

    expect(screen.getByText("skills-view")).toBeInTheDocument();
  });

  it("mounts the profile overview view", () => {
    render(<ProfilePage />);

    expect(screen.getByText("profile-overview-view")).toBeInTheDocument();
  });

  it("mounts the personal information view", () => {
    render(<PersonalInfoPage />);

    expect(screen.getByText("personal-info-view")).toBeInTheDocument();
  });

  it("mounts the presentation view", () => {
    render(<PresentationPage />);

    expect(screen.getByText("presentation-view")).toBeInTheDocument();
  });

  it("mounts the education view", () => {
    render(<EducationPage />);

    expect(screen.getByText("education-view")).toBeInTheDocument();
  });

  it("mounts the documents cv view", () => {
    render(<DocumentsPage />);

    expect(screen.getByText("documents-cv-view")).toBeInTheDocument();
  });

  it("mounts the certifications view", () => {
    render(<CertificationsPage />);

    expect(screen.getByText("certifications-view")).toBeInTheDocument();
  });

  it("mounts the work experience view", () => {
    render(<WorkExperiencePage />);

    expect(screen.getByText("work-experience-view")).toBeInTheDocument();
  });
});
