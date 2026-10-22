"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Loader2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EMPTY_EDUCATION_FORM_VALUES } from "../constants/education-form-defaults.constants";
import { EDUCATION_UI_TEXTS } from "../constants/education-ui.constants";
import { EDUCATION_DESCRIPTION_MAX_LENGTH, EDUCATION_MIN_DATE } from "../constants/education-validation.constants";
import { EDUCATION_INSTITUTION_TEXTS } from "../constants/education-institutions.constants";
import { useEducationInstitutions } from "../hooks/use-education-institutions";
import { resolveEducationInstitution } from "../utils/resolve-education-institution";
import { EducationInstitutionCombobox } from "./education-institution-combobox";
import { EducationDegreeCombobox } from "./education-degree-combobox";
import { EDUCATION_DEGREE_TEXTS } from "../constants/education-degree-ui.constants";
import { getEducationDegrees, resolveEducationDegree } from "../utils/resolve-education-degree";
import type { EducationFormProps } from "../types/education-form-props.types";
import type { EducationFormValues } from "../types/education-form-values.types";
import { getFieldErrorProps } from "@/modules/profile";
import { validateEducationForm } from "../utils/validate-education-form";
import { FeedbackMessage } from "@/modules/profile";
import { FormField } from "@/modules/profile";
import { FormFieldset } from "@/shared/components/layout/form-fieldset";
import { SectionCard } from "@/modules/profile";

export function EducationForm({
  initialValues,
  allowMissingEndDate = false,
  isPending = false,
  feedback = null,
  onSubmit,
  onCancel,
}: EducationFormProps) {
  const { institutions, isLoading: loadingInstitutions, error: institutionsError, reload: reloadInstitutions } = useEducationInstitutions();
  const catalogUnavailable = loadingInstitutions || !!institutionsError || !institutions.length;
  const [values, setValues] = useState<EducationFormValues>(
    initialValues ?? EMPTY_EDUCATION_FORM_VALUES,
  );
  const title = initialValues ? EDUCATION_UI_TEXTS.editTitle : EDUCATION_UI_TEXTS.createTitle;
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const selectedInstitution = resolveEducationInstitution(values.institution, institutions);
  const degrees = getEducationDegrees(selectedInstitution ?? '');
  const degreeHint = !selectedInstitution ? EDUCATION_DEGREE_TEXTS.selectInstitution
    : !degrees.length ? EDUCATION_DEGREE_TEXTS.noDegrees : null;
  const errors = hasSubmitted ? validateEducationForm(values, allowMissingEndDate, institutions) : {};

  const handleInstitutionChange = (institution: string) => {
    setValues((current) => {
      const previous = resolveEducationInstitution(current.institution, institutions);
      const next = resolveEducationInstitution(institution, institutions);
      if (!next || previous === next) return { ...current, institution };
      const degree = resolveEducationDegree(current.degree, getEducationDegrees(next ?? ''));
      return { ...current, institution, degree: degree ?? '' };
    });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending || catalogUnavailable) return;
    setHasSubmitted(true);
    if (Object.keys(validateEducationForm(values, allowMissingEndDate, institutions)).length > 0) return;
    const institution = resolveEducationInstitution(values.institution, institutions);
    if (!institution) return;
    const degree = resolveEducationDegree(values.degree, getEducationDegrees(institution));
    if (!degree) return;
    await onSubmit({ ...values, institution, degree });
  };

  return (
    <SectionCard title={title} className="min-w-0">
      <form aria-label={title} aria-busy={isPending} noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormFieldset title="Estudio">
        <FormField id="education-institution" label={EDUCATION_UI_TEXTS.institutionLabel} isRequired error={errors.institution}>
          <EducationInstitutionCombobox
            id="education-institution"
            error={errors.institution}
            value={values.institution}
            institutions={institutions}
            disabled={isPending || catalogUnavailable}
            onChange={handleInstitutionChange}
          />
          {loadingInstitutions ? <p role="status" className="text-sm text-text-secondary">{EDUCATION_INSTITUTION_TEXTS.loading}</p> : null}
          {institutionsError ? (
            <div className="flex flex-wrap items-center gap-2">
              <p role="alert" className="text-sm text-accent">{institutionsError}</p>
              <Button type="button" variant="outline" onClick={reloadInstitutions} disabled={isPending}>
                <RotateCw aria-hidden="true" />{EDUCATION_INSTITUTION_TEXTS.retry}
              </Button>
            </div>
          ) : null}
        </FormField>
        <FormField id="education-degree" label={EDUCATION_UI_TEXTS.degreeLabel} isRequired error={errors.degree}>
          <EducationDegreeCombobox
            key={selectedInstitution ?? ''}
            id="education-degree"
            error={errors.degree}
            describedBy={degreeHint ? 'education-degree-hint' : undefined}
            value={values.degree}
            degrees={degrees}
            disabled={isPending || catalogUnavailable || !selectedInstitution || !degrees.length}
            onChange={(degree) => setValues((current) => ({ ...current, degree }))}
          />
          {degreeHint ? <p id="education-degree-hint" role="status" className="text-sm text-text-secondary">{degreeHint}</p> : null}
        </FormField>
        </FormFieldset>
        <FormFieldset title="Periodo y detalle">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="education-startDate" label={EDUCATION_UI_TEXTS.startDateLabel} isRequired error={errors.startDate}>
            <Input
              id="education-startDate"
              {...getFieldErrorProps("education-startDate", errors.startDate)}
              name="startDate"
              type="date"
              min={EDUCATION_MIN_DATE}
              required
              value={values.startDate}
              disabled={isPending}
              onChange={handleChange}
              className="h-11"
            />
          </FormField>
          <FormField id="education-endDate" label={EDUCATION_UI_TEXTS.endDateLabel} isRequired={!allowMissingEndDate} error={errors.endDate}>
            <Input
              id="education-endDate"
              {...getFieldErrorProps("education-endDate", errors.endDate)}
              name="endDate"
              type="date"
              min={EDUCATION_MIN_DATE}
              required={!allowMissingEndDate}
              value={values.endDate}
              disabled={isPending}
              onChange={handleChange}
              className="h-11"
            />
          </FormField>
        </div>
        <FormField id="education-description" label={EDUCATION_UI_TEXTS.descriptionLabel} error={errors.description}>
          <div className="relative">
            <Textarea
              id="education-description"
              {...getFieldErrorProps("education-description", errors.description)}
              aria-describedby={errors.description ? "education-description-error education-description-count" : "education-description-count"}
              name="description"
              rows={3}
              maxLength={EDUCATION_DESCRIPTION_MAX_LENGTH}
              placeholder={EDUCATION_UI_TEXTS.descriptionPlaceholder}
              value={values.description ?? ""}
              disabled={isPending}
              onChange={handleChange}
              className="min-h-36 resize-y field-sizing-fixed pb-9 text-sm"
            />
            <span id="education-description-count" className="pointer-events-none absolute right-6 bottom-3 text-xs text-text-secondary">
              {(values.description ?? "").length}/{EDUCATION_DESCRIPTION_MAX_LENGTH}
            </span>
          </div>
        </FormField>

        </FormFieldset>
        <FeedbackMessage feedback={feedback} />
        <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
          <Button
            type="button"
            variant="outline"
            className="h-10 border-border-strong px-4 text-sm text-ink hover:bg-surface-soft"
            disabled={isPending}
            onClick={onCancel}
          >
            {EDUCATION_UI_TEXTS.cancelButton}
          </Button>
          <Button
            type="submit"
            className="h-10 min-w-40 bg-accent px-4 text-sm text-white hover:bg-brand-hover"
            disabled={isPending || catalogUnavailable}
          >
            {isPending ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
            {isPending ? EDUCATION_UI_TEXTS.savingButton : EDUCATION_UI_TEXTS.saveButton}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}
