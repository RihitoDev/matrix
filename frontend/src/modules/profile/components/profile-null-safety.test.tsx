import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ProfileSummary } from "../types/profile-summary.types";
import { ContactInfoCard } from "./contact-info-card";
import { EducationListCard } from "@/modules/education/components/education-list-card";
import { PresentationSummaryCard } from "./presentation-summary-card";
import { ProfileInfoItem } from "./profile-info-item";
import { ProfilePreviewCard } from "./profile-preview-card";
import { WorkExperienceListCard } from "@/modules/work-experience/components/work-experience-list-card";

const PROFILE_WITH_EMPTY_FIELDS = {
  fullName: null,
  headline: null,
  city: null,
  phone: null,
  personalEmail: null,
  aboutMe: null,
  interestedOpportunities: null,
} as unknown as ProfileSummary;

describe("profile components with missing data", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the placeholder when an info value is missing", () => {
    render(<ProfileInfoItem label="Teléfono" value={null} />);

    expect(screen.getByText("Sin registrar")).toBeInTheDocument();
  });

  it("renders the contact card when the profile fields are null", () => {
    render(<ContactInfoCard profile={PROFILE_WITH_EMPTY_FIELDS} />);

    expect(screen.getByText("Tu nombre")).toBeInTheDocument();
    expect(screen.getByText("Aún no agregaste un titular profesional")).toBeInTheDocument();
  });

  it("renders the presentation summary when the profile fields are null", () => {
    render(<PresentationSummaryCard profile={PROFILE_WITH_EMPTY_FIELDS} />);

    expect(screen.getByText("Cuenta quién eres y en qué te especializas.")).toBeInTheDocument();
  });

  it("renders the preview card when the values are null", () => {
    render(
      <ProfilePreviewCard
        fullName={null as unknown as string}
        presentation={{
          headline: null as unknown as string,
          aboutMe: null as unknown as string,
          interestedOpportunities: null as unknown as string,
        }}
      />,
    );

    expect(screen.getByText("Tu nombre")).toBeInTheDocument();
  });

  it("renders the lists without items when the arrays are missing", () => {
    render(
      <>
        <EducationListCard />
        <WorkExperienceListCard />
      </>,
    );

    expect(screen.getByText("Formación registrada")).toBeInTheDocument();
    expect(screen.getByText("Aún no registraste experiencia laboral.")).toBeInTheDocument();
  });
});
