"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PersonalInfoErrors } from "../types/personal-info-errors.types";
import type { PersonalInfoFormProps } from "../types/personal-info-form-props.types";
import type { PersonalInfoValues } from "../types/personal-info-values.types";
import { getFieldErrorProps } from "../utils/get-field-error-props";
import { trimFormValues } from "../utils/trim-form-values";
import { validatePersonalInfo } from "../utils/validate-personal-info";
import { FormField } from "./form-field";
import { ProfilePhotoField } from "./profile-photo-field";
import { SectionCard } from "./section-card";

export function PersonalInfoForm({
  initialValues,
  cities = [],
  isSaving = false,
  serverErrors = {},
  onEdit,
  photo,
  onSubmit,
}: PersonalInfoFormProps) {
  const [values, setValues] = useState<PersonalInfoValues>(initialValues);
  const [localErrors, setErrors] = useState<PersonalInfoErrors>({});
  const errors = { ...localErrors, ...serverErrors };

  const updateField = (field: keyof PersonalInfoValues, value: string) => {
    onEdit?.(field);
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateField(event.target.name as keyof PersonalInfoValues, event.target.value);
  };

  const handleCityChange = (cityId: string | null) => {
    updateField("cityId", cityId ?? "");
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
    const validationErrors = validatePersonalInfo(trimmedValues);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(trimmedValues);
    }
  };

  return (
    <SectionCard
      title="Tu información personal"
      description="Completa los campos para crear tu perfil. Podrás editarlos más adelante."
    >
      <ProfilePhotoField {...photo} />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8 pt-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <FormField id="firstName" label="Nombres" isRequired error={errors.firstName}>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="Escribe tus nombres"
              value={values.firstName}
              disabled={isSaving}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-surface px-4 text-[15px] text-ink placeholder:text-text-secondary/70 focus:border-ink-soft focus:ring-2 focus:ring-ink/10 focus:outline-none disabled:opacity-60 aria-invalid:border-accent aria-invalid:focus:ring-accent/15 h-12 md:text-[15px] focus-visible:border-ink-soft focus-visible:ring-2 focus-visible:ring-ink/10 aria-invalid:ring-0"
              {...getFieldErrorProps("firstName", errors.firstName)}
            />
          </FormField>
          <FormField id="lastName" label="Apellidos" isRequired error={errors.lastName}>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Escribe tus apellidos"
              value={values.lastName}
              disabled={isSaving}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-surface px-4 text-[15px] text-ink placeholder:text-text-secondary/70 focus:border-ink-soft focus:ring-2 focus:ring-ink/10 focus:outline-none disabled:opacity-60 aria-invalid:border-accent aria-invalid:focus:ring-accent/15 h-12 md:text-[15px] focus-visible:border-ink-soft focus-visible:ring-2 focus-visible:ring-ink/10 aria-invalid:ring-0"
              {...getFieldErrorProps("lastName", errors.lastName)}
            />
          </FormField>
          <FormField id="cityId" label="Ciudad de residencia" isRequired error={errors.cityId}>
            <Select
              name="cityId"
              value={values.cityId || null}
              items={cities.map((city) => ({ value: city.id, label: city.title }))}
              disabled={isSaving}
              onValueChange={handleCityChange}
            >
              <SelectTrigger
                id="cityId"
                className="w-full rounded-lg border border-border bg-surface px-4 text-[15px] text-ink focus:border-ink-soft focus:ring-2 focus:ring-ink/10 focus:outline-none disabled:opacity-60 aria-invalid:border-accent aria-invalid:focus:ring-accent/15 data-[size=default]:h-12 data-placeholder:text-text-secondary/70 focus-visible:border-ink-soft focus-visible:ring-2 focus-visible:ring-ink/10 aria-invalid:ring-0"
                {...getFieldErrorProps("cityId", errors.cityId)}
              >
                <SelectValue placeholder="Selecciona tu ciudad" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id} className="text-[15px]">
                    {city.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="phone" label="Teléfono" isRequired error={errors.phone}>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Ej. +591 700 00000"
              value={values.phone}
              disabled={isSaving}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-surface px-4 text-[15px] text-ink placeholder:text-text-secondary/70 focus:border-ink-soft focus:ring-2 focus:ring-ink/10 focus:outline-none disabled:opacity-60 aria-invalid:border-accent aria-invalid:focus:ring-accent/15 h-12 md:text-[15px] focus-visible:border-ink-soft focus-visible:ring-2 focus-visible:ring-ink/10 aria-invalid:ring-0"
              {...getFieldErrorProps("phone", errors.phone)}
            />
          </FormField>
          <FormField
            id="personalEmail"
            label="Correo personal"
            isRequired
            error={errors.personalEmail}
          >
            <Input
              id="personalEmail"
              name="personalEmail"
              type="email"
              autoComplete="email"
              placeholder="nombre@correo.com"
              value={values.personalEmail}
              disabled={isSaving}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-surface px-4 text-[15px] text-ink placeholder:text-text-secondary/70 focus:border-ink-soft focus:ring-2 focus:ring-ink/10 focus:outline-none disabled:opacity-60 aria-invalid:border-accent aria-invalid:focus:ring-accent/15 h-12 md:text-[15px] focus-visible:border-ink-soft focus-visible:ring-2 focus-visible:ring-ink/10 aria-invalid:ring-0"
              {...getFieldErrorProps("personalEmail", errors.personalEmail)}
            />
          </FormField>
        </div>

        <div className="flex items-center justify-between gap-6">
          <p className="text-[13px] text-text-secondary">* Campos obligatorios</p>
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
            <Button type="submit" className={cn("h-12 bg-accent px-6 text-[14px] font-semibold text-white hover:bg-danger", "min-w-44")} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar perfil"}
            </Button>
          </div>
        </div>
      </form>
    </SectionCard>
  );
}
