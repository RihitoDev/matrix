import type { PresentationSummaryCardProps } from "../types/presentation-summary-card-props.types";
import { EditSectionLink } from "./edit-section-link";
import { SectionCard } from "./section-card";

export function PresentationSummaryCard({ profile }: PresentationSummaryCardProps) {
  const aboutMe = (profile.aboutMe ?? "").trim();

  return (
    <SectionCard
      title="Presentación profesional"
      action={<EditSectionLink href="/profile/presentation" sectionName="presentación profesional" />}
    >
      <div>
        <p className={aboutMe ? "max-w-prose whitespace-pre-line break-words text-sm leading-7 text-ink-soft" : "max-w-prose text-sm leading-7 text-text-secondary"}>
          {aboutMe || "Cuenta quién eres, en qué te especializas y qué oportunidades laborales te interesan."}
        </p>
      </div>
    </SectionCard>
  );
}
