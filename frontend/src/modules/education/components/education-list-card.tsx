import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EDUCATION_FEEDBACK_MESSAGES } from "../constants/education-feedback.constants";
import { EDUCATION_UI_TEXTS } from "../constants/education-ui.constants";
import type { EducationListCardProps } from "../types/education-list-card-props.types";
import { formatEducationPeriod } from "../utils/format-education-period";
import { FeedbackMessage } from "@/modules/profile";
import { SectionCard } from "@/modules/profile";

export function EducationListCard({
  educations = [],
  isLoading = false,
  error = null,
  isBusy = false,
  onEdit,
  onDelete,
}: EducationListCardProps) {
  return (
    <SectionCard
      title={EDUCATION_UI_TEXTS.listTitle}
      description={EDUCATION_UI_TEXTS.listDescription}
    >
      {isLoading ? (
        <p role="status" className="text-[14px] text-text-secondary">
          {EDUCATION_FEEDBACK_MESSAGES.loading}
        </p>
      ) : error ? (
        <FeedbackMessage feedback={{ type: "error", message: error }} />
      ) : (educations ?? []).length === 0 ? (
        <p role="status" className="text-[14px] text-text-secondary">
          {EDUCATION_FEEDBACK_MESSAGES.empty}
        </p>
      ) : (
        <ul aria-label={EDUCATION_UI_TEXTS.listTitle} className="divide-y divide-border">
          {(educations ?? []).map((education) => (
            <li key={education.id} className="flex items-center justify-between gap-4 py-4 first:pt-0">
              <div className="min-w-0 break-words">
                <h3 className="text-[15px] font-bold text-ink">{education.degree}</h3>
                <p className="mt-0.5 text-[13px] text-text-secondary">
                  {education.institution} · {formatEducationPeriod(education.startDate, education.endDate)}
                </p>
                {education.description ? (
                  <p className="mt-2 whitespace-pre-line text-[13px] text-text-secondary">
                    {education.description}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  aria-label={`${EDUCATION_UI_TEXTS.editButton} ${education.degree}`}
                  disabled={isBusy}
                  onClick={() => onEdit?.(education)}
                  className="size-9 p-0 text-ink-soft"
                >
                  <Pencil className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  aria-label={`${EDUCATION_UI_TEXTS.deleteButton} ${education.degree}`}
                  disabled={isBusy}
                  onClick={() => onDelete?.(education)}
                  className="size-9 p-0 text-ink-soft hover:bg-interaction hover:text-ink"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 border-t border-border pt-4 text-[13px] text-text-secondary">
        {EDUCATION_UI_TEXTS.listFooter}
      </p>
    </SectionCard>
  );
}
