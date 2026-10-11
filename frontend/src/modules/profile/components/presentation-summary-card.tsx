import type { PresentationSummaryCardProps } from "../types/presentation-summary-card-props.types";
import { EditSectionLink } from "./edit-section-link";
import { SectionCard } from "./section-card";

export function PresentationSummaryCard({ profile }: PresentationSummaryCardProps) {
  const aboutMe = (profile.aboutMe ?? "").trim();
  const opportunities = (profile.interestedOpportunities ?? "").trim();

  return (
    <SectionCard
      title="Presentación profesional"
      action={<EditSectionLink href="/profile/presentation" sectionName="presentación profesional" />}
    >
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="font-tight text-[15px] font-bold text-ink">Acerca de</h3>
          <p className={aboutMe ? "mt-1 text-[15px] break-words whitespace-pre-line text-ink-soft" : "mt-1 text-[15px] text-text-secondary"}>
            {aboutMe || "Cuenta quién eres y en qué te especializas."}
          </p>
        </div>
        <div>
          <h3 className="font-tight text-[15px] font-bold text-ink">Oportunidades que me interesan</h3>
          <p className={opportunities ? "mt-1 text-[15px] break-words whitespace-pre-line text-ink-soft" : "mt-1 text-[15px] text-text-secondary"}>
            {opportunities || "Indica qué oportunidades laborales te interesan."}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
