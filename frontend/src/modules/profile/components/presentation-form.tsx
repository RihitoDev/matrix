"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PresentationErrors } from "../types/presentation-errors.types";
import type { PresentationFormProps } from "../types/presentation-form-props.types";
import type { PresentationValues } from "../types/presentation-values.types";
import { getFieldErrorProps } from "../utils/get-field-error-props";
import { trimFormValues } from "../utils/trim-form-values";
import { validatePresentation } from "../utils/validate-presentation";
import { FormField } from "./form-field";
import { ProfilePreviewCard } from "./profile-preview-card";
import { SectionCard } from "./section-card";
import { WritingTipsCard } from "./writing-tips-card";

export function PresentationForm({
  initialValues,
  fullName,
  photoUrl,
  isSaving = false,
  serverErrors = {},
  onEdit,
  onSubmit,
}: PresentationFormProps) {
  const [values, setValues] = useState<PresentationValues>(initialValues);
  const [localErrors, setErrors] = useState<PresentationErrors>({});
  const errors = { ...localErrors, ...serverErrors };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = event.target.name as keyof PresentationValues;
    onEdit?.(field);
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleCancel = () => {
    onEdit?.();
    setValues(initialValues);
    setErrors({});
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    const trimmedValues = trimFormValues(values);
    const validationErrors = validatePresentation(trimmedValues);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(trimmedValues);
    }
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_380px] items-start gap-6">
      <SectionCard
        title="Escribe tu presentación"
        description="Un resumen claro ayuda a entender qué haces y qué buscas."
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <FormField id="headline" label="Titular profesional" isRequired error={errors.headline}>
            <Input
              id="headline"
              name="headline"
              type="text"
              placeholder="Ej. Desarrolladora web junior"
              value={values.headline}
              disabled={isSaving}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-surface px-4 text-[15px] text-ink placeholder:text-text-secondary/70 focus:border-ink-soft focus:ring-2 focus:ring-ink/10 focus:outline-none disabled:opacity-60 aria-invalid:border-accent aria-invalid:focus:ring-accent/15 h-12 md:text-[15px] focus-visible:border-ink-soft focus-visible:ring-2 focus-visible:ring-ink/10 aria-invalid:ring-0"
              {...getFieldErrorProps("headline", errors.headline)}
            />
          </FormField>
          <FormField id="aboutMe" label="Acerca de" isRequired error={errors.aboutMe}>
            <Textarea
              id="aboutMe"
              name="aboutMe"
              rows={6}
              placeholder="Cuenta quién eres y en qué te especializas."
              value={values.aboutMe}
              disabled={isSaving}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-surface px-4 text-[15px] text-ink placeholder:text-text-secondary/70 focus:border-ink-soft focus:ring-2 focus:ring-ink/10 focus:outline-none disabled:opacity-60 aria-invalid:border-accent aria-invalid:focus:ring-accent/15 resize-y py-3 field-sizing-fixed min-h-0 md:text-[15px] focus-visible:border-ink-soft focus-visible:ring-2 focus-visible:ring-ink/10 aria-invalid:ring-0"
              {...getFieldErrorProps("aboutMe", errors.aboutMe)}
            />
          </FormField>
          <FormField id="interestedOpportunities" label="Oportunidades que me interesan">
            <Textarea
              id="interestedOpportunities"
              name="interestedOpportunities"
              rows={3}
              placeholder="Ej. Prácticas o empleo en desarrollo frontend, trabajo remoto."
              value={values.interestedOpportunities}
              disabled={isSaving}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-surface px-4 text-[15px] text-ink placeholder:text-text-secondary/70 focus:border-ink-soft focus:ring-2 focus:ring-ink/10 focus:outline-none disabled:opacity-60 aria-invalid:border-accent aria-invalid:focus:ring-accent/15 resize-y py-3 field-sizing-fixed min-h-0 md:text-[15px] focus-visible:border-ink-soft focus-visible:ring-2 focus-visible:ring-ink/10 aria-invalid:ring-0"
            />
          </FormField>

          <div className="flex items-center justify-between gap-6 pt-3">
            <p className="text-[13px] text-text-secondary">
              Estos textos aparecerán en tu perfil público.
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 border-border-strong bg-surface px-6 text-[14px] font-semibold text-ink hover:bg-surface-soft"
                disabled={isSaving}
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <Button type="submit" className={cn("h-12 bg-accent px-6 text-[14px] font-semibold text-white hover:bg-danger", "min-w-52")} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar presentación"}
              </Button>
            </div>
          </div>
        </form>
      </SectionCard>

      <div className="flex flex-col gap-6">
        <ProfilePreviewCard fullName={fullName} photoUrl={photoUrl} presentation={values} />
        <WritingTipsCard />
      </div>
    </div>
  );
}
