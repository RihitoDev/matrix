"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CERTIFICATION_DOCUMENT_VALIDATION_MESSAGES } from "../constants/certification-form.constants";
import type { CertificationDocumentFormProps } from "../types/certification-document-form-props.types";
import { getFieldErrorProps } from "@/modules/profile/utils/get-field-error-props";
import { validateCertificateFile } from "../utils/validate-certificate-file";
import { CertificationDocumentField } from "./certification-document-field";
import { FormField } from "@/modules/profile/components/form-field";

const CERTIFICATION_SELECT_ID = "document-certification";

export function CertificationDocumentForm({
  certifications = [],
  isPending = false,
  onSubmit,
}: CertificationDocumentFormProps) {
  const [certificationId, setCertificationId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [certificationError, setCertificationError] = useState<string | undefined>();
  const [fileError, setFileError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isBusy = isPending || isSubmitting;

  const handleSelectFile = (file: File) => {
    const validationError = validateCertificateFile(file);
    if (validationError) {
      setSelectedFile(null);
      setFileError(validationError);
      return;
    }
    setSelectedFile(file);
    setFileError(undefined);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFileError(undefined);
  };

  const handleCertificationChange = (value: string | null) => {
    setCertificationId(value ?? "");
    setCertificationError(undefined);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextCertificationError = certificationId
      ? undefined
      : CERTIFICATION_DOCUMENT_VALIDATION_MESSAGES.certificationRequired;
    const nextFileError =
      fileError ?? (selectedFile ? undefined : CERTIFICATION_DOCUMENT_VALIDATION_MESSAGES.fileRequired);
    setCertificationError(nextCertificationError);
    setFileError(nextFileError);

    if (nextCertificationError || nextFileError || !selectedFile) {
      return;
    }

    setIsSubmitting(true);
    try {
      const wasSaved = await onSubmit(certificationId, selectedFile);
      if (wasSaved) {
        setCertificationId("");
        setSelectedFile(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      aria-label="Vincular documento"
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
    >
      <FormField
        id={CERTIFICATION_SELECT_ID}
        label="Certificación asociada"
        isRequired
        error={certificationError}
      >
        <Select
          name="certificationId"
          value={certificationId || null}
          items={certifications.map((certification) => ({
            value: certification.id,
            label: certification.name,
          }))}
          disabled={isBusy || certifications.length === 0}
          onValueChange={handleCertificationChange}
        >
          <SelectTrigger
            id={CERTIFICATION_SELECT_ID}
            className="w-full rounded-lg border border-border bg-surface px-4 text-[15px] text-ink focus:border-ink-soft focus:ring-2 focus:ring-ink/10 focus:outline-none disabled:opacity-60 aria-invalid:border-accent aria-invalid:focus:ring-accent/15 data-[size=default]:h-12 data-placeholder:text-text-secondary/70 focus-visible:border-ink-soft focus-visible:ring-2 focus-visible:ring-ink/10 aria-invalid:ring-0"
            {...getFieldErrorProps(CERTIFICATION_SELECT_ID, certificationError)}
          >
            <SelectValue placeholder="Selecciona una certificación" />
          </SelectTrigger>
          <SelectContent>
            {certifications.map((certification) => (
              <SelectItem key={certification.id} value={certification.id} className="text-[15px]">
                {certification.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <CertificationDocumentField
        selectedFile={selectedFile}
        error={fileError}
        disabled={isBusy}
        isUploading={isBusy}
        onSelectFile={handleSelectFile}
        onClearFile={handleClearFile}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="text-[13px] text-text-secondary">
          El archivo se vinculará a la certificación elegida.
        </p>
        <Button
          type="submit"
          className="h-12 min-w-44 bg-accent px-6 text-[14px] font-semibold text-white hover:bg-danger"
          disabled={isBusy}
        >
          {isBusy ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
          {isBusy ? "Guardando..." : "Guardar documento"}
        </Button>
      </div>
    </form>
  );
}
