"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CertificationErrors } from "../types/certification-errors.types";
import type { CertificationFormProps } from "../types/certification-form-props.types";
import type { CreateCertificationDto } from "../types/create-certification-dto.types";
import { getFieldErrorProps } from "@/modules/profile/utils/get-field-error-props";
import { trimFormValues } from "@/modules/profile/utils/trim-form-values";
import { validateCertificateFile } from "../utils/validate-certificate-file";
import { getTodayIsoDate, validateCertification } from "../utils/validate-certification";
import { CertificationDocumentField } from "./certification-document-field";
import { FormField } from "@/modules/profile/components/form-field";

const EMPTY_CERTIFICATION_VALUES: CreateCertificationDto = {
  name: "",
  issuingOrganization: "",
  issueDate: "",
};

export function CertificationForm({
  initialData,
  isPending = false,
  onSubmit,
  onCancel,
}: CertificationFormProps) {
  const [values, setValues] = useState<CreateCertificationDto>(
    initialData ?? EMPTY_CERTIFICATION_VALUES,
  );
  const [errors, setErrors] = useState<CertificationErrors>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(initialData);
  const isBusy = isPending || isSubmitting;
  const title = isEditing ? "Editar certificación" : "Agregar certificación";

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name as keyof CreateCertificationDto;
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSelectFile = (file: File) => {
    const error = validateCertificateFile(file);
    if (error) {
      setFileError(error);
      setSelectedFile(null);
    } else {
      setSelectedFile(file);
      setFileError(undefined);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFileError(undefined);
  };

  const handleCancel = () => {
    setValues(EMPTY_CERTIFICATION_VALUES);
    setErrors({});
    setSelectedFile(null);
    setFileError(undefined);
    onCancel();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedValues = trimFormValues(values);
    const validationErrors = validateCertification(trimmedValues);
    
    let currentFileError = fileError;
    if (!isEditing && !selectedFile) {
      currentFileError = "El documento de respaldo es obligatorio para crear una certificación.";
      setFileError(currentFileError);
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0 || currentFileError) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(trimmedValues, selectedFile);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form aria-label={title} noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      <h3 className="font-tight text-[18px] font-bold text-ink">{title}</h3>
      <FormField
        id="certification-name"
        label="Nombre de la certificación"
        isRequired
        error={errors.name}
      >
        <Input
          id="certification-name"
          name="name"
          type="text"
          placeholder="Ej. AWS Certified Cloud Practitioner"
          value={values.name}
          disabled={isBusy}
          onChange={handleChange}
          className="w-full rounded-lg border border-border bg-surface px-4 text-[15px] text-ink placeholder:text-text-secondary/70 focus:border-ink-soft focus:ring-2 focus:ring-ink/10 focus:outline-none disabled:opacity-60 aria-invalid:border-accent aria-invalid:focus:ring-accent/15 h-12 md:text-[15px] focus-visible:border-ink-soft focus-visible:ring-2 focus-visible:ring-ink/10 aria-invalid:ring-0"
          {...getFieldErrorProps("certification-name", errors.name)}
        />
      </FormField>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          id="certification-issuingOrganization"
          label="Entidad emisora"
          isRequired
          error={errors.issuingOrganization}
        >
          <Input
            id="certification-issuingOrganization"
            name="issuingOrganization"
            type="text"
            placeholder="Ej. Amazon Web Services"
            value={values.issuingOrganization}
            disabled={isBusy}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-surface px-4 text-[15px] text-ink placeholder:text-text-secondary/70 focus:border-ink-soft focus:ring-2 focus:ring-ink/10 focus:outline-none disabled:opacity-60 aria-invalid:border-accent aria-invalid:focus:ring-accent/15 h-12 md:text-[15px] focus-visible:border-ink-soft focus-visible:ring-2 focus-visible:ring-ink/10 aria-invalid:ring-0"
            {...getFieldErrorProps("certification-issuingOrganization", errors.issuingOrganization)}
          />
        </FormField>
        <FormField
          id="certification-issueDate"
          label="Fecha de obtención"
          isRequired
          error={errors.issueDate}
        >
          <Input
            id="certification-issueDate"
            name="issueDate"
            type="date"
            max={getTodayIsoDate()}
            value={values.issueDate}
            disabled={isBusy}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-surface px-4 text-[15px] text-ink placeholder:text-text-secondary/70 focus:border-ink-soft focus:ring-2 focus:ring-ink/10 focus:outline-none disabled:opacity-60 aria-invalid:border-accent aria-invalid:focus:ring-accent/15 h-12 md:text-[15px] focus-visible:border-ink-soft focus-visible:ring-2 focus-visible:ring-ink/10 aria-invalid:ring-0"
            {...getFieldErrorProps("certification-issueDate", errors.issueDate)}
          />
        </FormField>
      </div>
      {!isEditing ? (
        <CertificationDocumentField
          id="create-certification-document"
          selectedFile={selectedFile}
          error={fileError}
          disabled={isBusy}
          onSelectFile={handleSelectFile}
          onClearFile={handleClearFile}
        />
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="text-[13px] text-text-secondary">* Campos obligatorios</p>
        <div className="flex gap-3">
          {isEditing ? (
            <Button
              type="button"
              variant="outline"
              className="h-12 border-border-strong bg-surface px-6 text-[14px] font-semibold text-ink hover:bg-surface-soft"
              disabled={isBusy}
              onClick={handleCancel}
            >
              Cancelar
            </Button>
          ) : null}
          <Button
            type="submit"
            className="h-12 min-w-44 bg-accent px-6 text-[14px] font-semibold text-white hover:bg-danger"
            disabled={isBusy}
          >
            {isBusy ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
            {isBusy ? "Guardando..." : "Guardar certificación"}
          </Button>
        </div>
      </div>
    </form>
  );
}
