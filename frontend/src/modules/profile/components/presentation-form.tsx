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
import { FormFieldset } from "@/shared/components/layout/form-fieldset";
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
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] items-start gap-6">
      <SectionCard
        title="Escribe tu presentación"
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <FormFieldset title="Tu especialidad">
          <FormField id="headline" label="Titular profesional" isRequired error={errors.headline}>
            <Input
              id="headline"
              name="headline"
              type="text"
              placeholder="Ej. Desarrolladora web junior"
              value={values.headline}
              disabled={isSaving}
              onChange={handleChange}
              className="h-11"
              {...getFieldErrorProps("headline", errors.headline)}
            />
          </FormField>
          </FormFieldset>
          <FormFieldset title="Sobre ti">
          <FormField id="aboutMe" label="Acerca de" isRequired error={errors.aboutMe}>
            <Textarea
              id="aboutMe"
              name="aboutMe"
              rows={6}
              placeholder="Cuenta quién eres, en qué te especializas y qué oportunidades laborales te interesan."
              value={values.aboutMe}
              disabled={isSaving}
              onChange={handleChange}
              className="min-h-36 resize-y field-sizing-fixed text-sm"
              {...getFieldErrorProps("aboutMe", errors.aboutMe)}
            />
          </FormField>

          </FormFieldset>
          <div className="flex flex-wrap items-center justify-end gap-4 border-t border-border pt-5">
            <p className="text-[13px] text-text-secondary">
              Los cambios se muestran al guardar.
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-10 border-border-strong px-4 text-sm text-ink hover:bg-surface-soft"
                disabled={isSaving}
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <Button type="submit" className={cn("h-10 bg-accent px-4 text-sm text-white hover:bg-brand-hover", "min-w-44")} disabled={isSaving}>
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
