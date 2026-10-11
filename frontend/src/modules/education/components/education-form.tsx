"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EMPTY_EDUCATION_FORM_VALUES } from "../constants/education-form-defaults.constants";
import { EDUCATION_UI_TEXTS } from "../constants/education-ui.constants";
import type { EducationFormProps } from "../types/education-form-props.types";
import type { EducationFormValues } from "../types/education-form-values.types";
import { getFieldErrorProps } from "@/modules/profile/utils/get-field-error-props";
import { validateEducationForm } from "../utils/validate-education-form";
import { FeedbackMessage } from "@/modules/profile/components/feedback-message";
import { FormField } from "@/modules/profile/components/form-field";
import { SectionCard } from "@/modules/profile/components/section-card";

export function EducationForm({
  initialValues,
  allowMissingEndDate = false,
  isPending = false,
  feedback = null,
  onSubmit,
  onCancel,
}: EducationFormProps) {
  const [values, setValues] = useState<EducationFormValues>(
    initialValues ?? EMPTY_EDUCATION_FORM_VALUES,
  );
  const title = initialValues ? EDUCATION_UI_TEXTS.editTitle : EDUCATION_UI_TEXTS.createTitle;
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const errors = hasSubmitted ? validateEducationForm(values, allowMissingEndDate) : {};

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;
    setHasSubmitted(true);
    if (Object.keys(validateEducationForm(values, allowMissingEndDate)).length > 0) return;
    await onSubmit(values);
  };

  return (
    <SectionCard title={title}>
      <form aria-label={title} aria-busy={isPending} noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField id="education-institution" label={EDUCATION_UI_TEXTS.institutionLabel} isRequired error={errors.institution}>
          <Input
            id="education-institution"
            {...getFieldErrorProps("education-institution", errors.institution)}
            name="institution"
            type="text"
            required
            placeholder={EDUCATION_UI_TEXTS.institutionPlaceholder}
            autoFocus
            value={values.institution}
            disabled={isPending}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-surface px-4 text-[15px] text-ink placeholder:text-text-secondary/70 focus:border-ink-soft focus:ring-2 focus:ring-ink/10 focus:outline-none disabled:opacity-60 aria-invalid:border-accent aria-invalid:focus:ring-accent/15 h-12 md:text-[15px] focus-visible:border-ink-soft focus-visible:ring-2 focus-visible:ring-ink/10 aria-invalid:ring-0"
          />
        </FormField>
        <FormField id="education-degree" label={EDUCATION_UI_TEXTS.degreeLabel} isRequired error={errors.degree}>
          <Input
            id="education-degree"
            {...getFieldErrorProps("education-degree", errors.degree)}
            name="degree"
            type="text"
            required
            placeholder={EDUCATION_UI_TEXTS.degreePlaceholder}
            value={values.degree}
            disabled={isPending}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-surface px-4 text-[15px] text-ink placeholder:text-text-secondary/70 focus:border-ink-soft focus:ring-2 focus:ring-ink/10 focus:outline-none disabled:opacity-60 aria-invalid:border-accent aria-invalid:focus:ring-accent/15 h-12 md:text-[15px] focus-visible:border-ink-soft focus-visible:ring-2 focus-visible:ring-ink/10 aria-invalid:ring-0"
          />
        </FormField>
        <div className="grid grid-cols-2 gap-5">
          <FormField id="education-startDate" label={EDUCATION_UI_TEXTS.startDateLabel} isRequired error={errors.startDate}>
            <Input
              id="education-startDate"
              {...getFieldErrorProps("education-startDate", errors.startDate)}
              name="startDate"
              type="date"
              required
              value={values.startDate}
              disabled={isPending}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-surface px-4 text-[15px] text-ink placeholder:text-text-secondary/70 focus:border-ink-soft focus:ring-2 focus:ring-ink/10 focus:outline-none disabled:opacity-60 aria-invalid:border-accent aria-invalid:focus:ring-accent/15 h-12 md:text-[15px] focus-visible:border-ink-soft focus-visible:ring-2 focus-visible:ring-ink/10 aria-invalid:ring-0"
            />
          </FormField>
          <FormField id="education-endDate" label={EDUCATION_UI_TEXTS.endDateLabel} isRequired={!allowMissingEndDate} error={errors.endDate}>
            <Input
              id="education-endDate"
              {...getFieldErrorProps("education-endDate", errors.endDate)}
              name="endDate"
              type="date"
              required={!allowMissingEndDate}
              value={values.endDate}
              disabled={isPending}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-surface px-4 text-[15px] text-ink placeholder:text-text-secondary/70 focus:border-ink-soft focus:ring-2 focus:ring-ink/10 focus:outline-none disabled:opacity-60 aria-invalid:border-accent aria-invalid:focus:ring-accent/15 h-12 md:text-[15px] focus-visible:border-ink-soft focus-visible:ring-2 focus-visible:ring-ink/10 aria-invalid:ring-0"
            />
          </FormField>
        </div>
        <FormField id="education-description" label={EDUCATION_UI_TEXTS.descriptionLabel}>
          <Textarea
            id="education-description"
            name="description"
            rows={3}
            placeholder={EDUCATION_UI_TEXTS.descriptionPlaceholder}
            value={values.description}
            disabled={isPending}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-surface px-4 text-[15px] text-ink placeholder:text-text-secondary/70 focus:border-ink-soft focus:ring-2 focus:ring-ink/10 focus:outline-none disabled:opacity-60 aria-invalid:border-accent aria-invalid:focus:ring-accent/15 resize-y py-3 field-sizing-fixed min-h-0 md:text-[15px] focus-visible:border-ink-soft focus-visible:ring-2 focus-visible:ring-ink/10 aria-invalid:ring-0"
          />
        </FormField>

        <FeedbackMessage feedback={feedback} />
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="h-12 border-border-strong bg-surface px-6 text-[14px] font-semibold text-ink hover:bg-surface-soft"
            disabled={isPending}
            onClick={onCancel}
          >
            {EDUCATION_UI_TEXTS.cancelButton}
          </Button>
          <Button
            type="submit"
            className="h-12 min-w-44 bg-accent px-6 text-[14px] font-semibold text-white hover:bg-danger"
            disabled={isPending}
          >
            {isPending ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
            {isPending ? EDUCATION_UI_TEXTS.savingButton : EDUCATION_UI_TEXTS.saveButton}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}
