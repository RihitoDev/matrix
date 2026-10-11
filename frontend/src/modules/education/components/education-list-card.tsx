import { Button } from "@/components/ui/button";
import { EDUCATION_FEEDBACK_MESSAGES } from "../constants/education-feedback.constants";
import { EDUCATION_UI_TEXTS } from "../constants/education-ui.constants";
import type { EducationListCardProps } from "../types/education-list-card-props.types";
import { formatEducationPeriod } from "../utils/format-education-period";
import { FeedbackMessage } from "@/modules/profile/components/feedback-message";
import { SectionCard } from "@/modules/profile/components/section-card";

export function EducationListCard({
  educations = [],
  isLoading = false,
  error = null,
  isBusy = false,
  onAdd,
  onEdit,
  onDelete,
}: EducationListCardProps) {
  return (
    <SectionCard
      title={EDUCATION_UI_TEXTS.listTitle}
      description={EDUCATION_UI_TEXTS.listDescription}
      action={onAdd ? (
        <Button
          type="button"
          onClick={onAdd}
          disabled={isBusy}
          className="h-10 bg-accent px-4 text-[14px] font-semibold text-white hover:bg-danger"
        >
          {EDUCATION_UI_TEXTS.addButton}
        </Button>
      ) : undefined}
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
                  className="h-8 px-2 text-[13px] font-semibold text-ink"
                >
                  {EDUCATION_UI_TEXTS.editButton}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  aria-label={`${EDUCATION_UI_TEXTS.deleteButton} ${education.degree}`}
                  disabled={isBusy}
                  onClick={() => onDelete?.(education)}
                  className="h-8 px-2 text-[13px] font-semibold text-accent hover:bg-interaction hover:text-accent"
                >
                  {EDUCATION_UI_TEXTS.deleteButton}
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
