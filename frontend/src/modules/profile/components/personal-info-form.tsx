"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PersonalInfoErrors } from "../types/personal-info-errors.types";
import type { PersonalInfoFormProps } from "../types/personal-info-form-props.types";
import type { PersonalInfoValues } from "../types/personal-info-values.types";
import { PHONE_HINT, PHONE_HINT_ID } from "../constants/profile-validation.constants";
import { getFieldErrorId, getFieldErrorProps } from "../utils/get-field-error-props";
import { limitPhoneDigits } from "../utils/limit-phone-digits";
import { trimFormValues } from "../utils/trim-form-values";
import { validatePersonalInfo } from "../utils/validate-personal-info";
import { FormField } from "./form-field";
import { ProfilePhotoField } from "./profile-photo-field";
import { FormSection } from "@/shared/components/layout/form-section";

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
    const field = event.target.name as keyof PersonalInfoValues;
    const value = field === "phone" ? limitPhoneDigits(event.target.value) : event.target.value;
    updateField(field, value);
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
    <div className="rounded-lg border border-border bg-surface">
      <div className="border-b border-border px-6 py-6 lg:px-8">
      <ProfilePhotoField {...photo} />

      </div>
      <form onSubmit={handleSubmit} noValidate className="px-6 pt-6 lg:px-8">
        <FormSection title="Identidad" description="Tu nombre en la comunidad.">
          <div className="grid gap-5 md:grid-cols-2">
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
              className="h-11"
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
              className="h-11"
              {...getFieldErrorProps("lastName", errors.lastName)}
            />
          </FormField>
          </div>
        </FormSection>
        <FormSection title="Contacto" description="Dónde pueden encontrarte.">
          <div className="grid gap-5 md:grid-cols-2">
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
                className="w-full data-[size=default]:h-11"
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
              className="h-11"
              {...getFieldErrorProps("phone", errors.phone)}
              aria-describedby={[PHONE_HINT_ID, errors.phone ? getFieldErrorId("phone") : null]
                .filter(Boolean)
                .join(" ")}
            />
            <p id={PHONE_HINT_ID} className="text-[13px] text-text-secondary">
              {PHONE_HINT}
            </p>
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
              className="h-11"
              {...getFieldErrorProps("personalEmail", errors.personalEmail)}
            />
          </FormField>
          </div>
        </FormSection>
        <div className="sticky bottom-0 z-10 -mx-6 flex flex-wrap items-center justify-between gap-4 rounded-b-lg border-t border-border bg-surface px-6 py-5 lg:-mx-8 lg:px-8">
          <p className="text-[13px] text-text-secondary">* Campos obligatorios</p>
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
              {isSaving ? "Guardando..." : "Guardar perfil"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
