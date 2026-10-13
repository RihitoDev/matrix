import { BriefcaseBusiness } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { MentorProfile } from "../../types/mentor-profile.types";

type MentorCareerProps = {
  mentor: MentorProfile;
};

export function MentorCareer({ mentor }: MentorCareerProps) {
  const currentExperience = mentor.workExperiences.find(
    (experience) => experience.isCurrent,
  );
  const education = mentor.educations[0];

  if (!currentExperience && !education) {
    return null;
  }

  return (
    <Card className="gap-0 overflow-visible rounded-xl border border-border bg-white py-0 text-base shadow-sm ring-0">
      <CardHeader className="px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-soft text-ink">
            <BriefcaseBusiness size={20} />
          </div>

          <CardTitle
            role="heading"
            aria-level={2}
            className="text-xl font-bold text-ink"
          >
            Trayectoria actual
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-6 pb-6 pt-5">
        {currentExperience && (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Cargo
              </p>

              <p className="mt-1 [overflow-wrap:anywhere] font-semibold text-ink">
                {currentExperience.position}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Empresa
              </p>

              <p className="mt-1 [overflow-wrap:anywhere] text-ink">
                {currentExperience.company.title}
              </p>
            </div>
          </>
        )}

        {education && (
          <div>
            {currentExperience && <Separator className="mb-4" />}

            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Formación
            </p>

            <p className="mt-1 [overflow-wrap:anywhere] font-semibold text-ink">{education.degree}</p>
            <p className="mt-1 [overflow-wrap:anywhere] text-ink">{education.institution}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
