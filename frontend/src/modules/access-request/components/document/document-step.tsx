"use client";

import { ArrowLeft, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DocumentType } from "../../constants/document-types.constants";
import { useAccessRequestForm } from "../../contexts/access-request-context";
import { DocumentDropzone } from "./document-dropzone";
import { DocumentPreviewCard } from "./document-preview-card";
import { FieldError } from "../personal-data/field-error";
import { RequiredMark } from "../personal-data/required-mark";

const DOCUMENT_TYPE_OPTIONS: ReadonlyArray<{ value: DocumentType; label: string }> = [
  { value: "academic_diploma", label: "Diploma académico" },
  { value: "national_title", label: "Título en provisión nacional" },
];

const RECOMMENDATIONS = [
  "Documento completo, sin recortes ni partes tapadas.",
  "Nombre y número del documento legibles.",
  "Imagen con buena luz, sin reflejos ni sombras.",
  "Formato JPG, PNG o PDF de hasta 10 MB.",
];

export function DocumentStep() {
  const { values, status, document: documentState, hasDocument, submitError, goToStep, selectDocumentType, submitRequest } =
    useAccessRequestForm();
  const fullName = [values.firstName.trim(), values.lastName.trim()].filter(Boolean).join(" ");
  const isIdle = status === "idle";

  return (
    <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px] 2xl:gap-8">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink 2xl:text-4xl">Documento de respaldo</h1>
          <p className="max-w-155 text-[15px] text-text-secondary 2xl:text-lg">
            {`El nombre del documento debe coincidir con el que escribiste en el paso anterior: ${fullName}`}
          </p>
        </div>

        <div>
          <Label htmlFor="documentType" className="mb-1.5 text-[12.5px] font-semibold text-ink 2xl:text-base">
            Tipo de documento
            <RequiredMark />
          </Label>
          <Select
            name="documentType"
            items={DOCUMENT_TYPE_OPTIONS}
            value={documentState.documentType || null}
            onValueChange={(value) => {
              if (value) selectDocumentType(value as DocumentType);
            }}
            disabled={hasDocument || !isIdle}
          >
            <SelectTrigger
              id="documentType"
              aria-required="true"
              className="w-full rounded-md border-border bg-surface px-3 text-[15px] text-ink focus-visible:border-accent focus-visible:ring-interaction data-[size=default]:h-[42px] 2xl:text-base 2xl:data-[size=default]:h-12"
            >
              <SelectValue placeholder="Elige el tipo de documento" />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="focus:bg-muted focus:text-foreground">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasDocument ? <DocumentPreviewCard /> : <DocumentDropzone />}

        {submitError ? (
          <div role="alert">
            <FieldError id="submit-error" message={submitError} />
          </div>
        ) : null}

        <div className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <Button
            type="button"
            variant="ghost"
            disabled={!isIdle}
            onClick={() => goToStep(1)}
            className="h-[42px] rounded-md px-5 text-[14.5px] font-semibold text-ink 2xl:h-12"
          >
            <ArrowLeft aria-hidden="true" />
            Volver a mis datos
          </Button>
          <Button
            type="button"
            disabled={!hasDocument || !isIdle}
            onClick={() => void submitRequest()}
            className="h-[42px] 2xl:h-12 rounded-md bg-ink px-5 text-[14.5px] font-semibold text-surface hover:bg-ink/90"
          >
            {status === "sending" ? "Enviando..." : "Enviar solicitud"}
          </Button>
        </div>
      </div>

      <aside className="h-fit rounded-xl border border-border bg-surface p-5">
        <h2 className="text-[15px] font-bold text-ink 2xl:text-lg">Para que tu solicitud se apruebe sin demoras</h2>
        <ul className="mt-3 flex flex-col gap-2.5">
          {RECOMMENDATIONS.map((tip) => (
            <li key={tip} className="flex gap-2 text-[13.5px] text-ink 2xl:text-base">
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
        <p className="mt-4 flex gap-2 border-t border-border pt-3 text-[12.5px] text-text-secondary 2xl:text-base">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Si tu documento es rechazado, recibirás el motivo por correo y podrás subir otro.
        </p>
      </aside>
    </div>
  );
}
