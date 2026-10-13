"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DESCRIPTION_PREVIEW_CHARS, PUBLISHED_DIALOG_TEXT } from "../constants/vacancies.constants";
import type { CurrentCompany, PublishError } from "../types/job-offer.types";
import type { VacancyConditions } from "../types/vacancy-conditions.types";
import { ConfirmDialog } from "./confirm-dialog";
import { StepActions } from "./step-actions";

interface PreviewStepProps {
  conditions: VacancyConditions;
  company: CurrentCompany;
  isSubmitting: boolean;
  isPublished: boolean;
  error: PublishError | null;
  onPrevious: () => void;
  onConfirm: () => void;
  onFinish: () => void;
}

function formatDescription(description: string, isExpanded: boolean): string {
  const text = description.trim();
  if (isExpanded || text.length <= DESCRIPTION_PREVIEW_CHARS) return text;
  return `${text.slice(0, DESCRIPTION_PREVIEW_CHARS).trimEnd()}...`;
}

export function PreviewStep({
  conditions,
  company,
  isSubmitting,
  isPublished,
  error,
  onPrevious,
  onConfirm,
  onFinish,
}: PreviewStepProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const canExpand = conditions.description.trim().length > DESCRIPTION_PREVIEW_CHARS;
  const mapsLink = conditions.mapsLink.trim();

  return (
    <div className="mt-8 w-full">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
        VISTA PREVIA DE LA PUBLICACIÓN
      </h3>

      <div className="mx-auto max-w-3xl rounded-lg border border-t-[4px] border-gray-100 border-t-[#E50000] bg-white p-8 shadow-[0_2px_10px_rgb(0,0,0,0.06)]">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-[50px] w-[50px] items-center justify-center rounded-lg bg-[#0f172a] text-lg font-bold tracking-wider text-white">
            {company.initials}
          </div>
          <div>
            <h4 className="text-[15px] font-extrabold leading-tight text-gray-900">{company.name}</h4>
            <p className="text-[13px] text-gray-500">Empresa verificada</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-[22px] font-extrabold text-gray-900">{conditions.title}</h2>
          <p className="mt-1 text-[13px] font-bold text-amber-500">{conditions.category}</p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-gray-50 px-4 py-2.5 text-[13px] font-medium text-gray-700">
            {conditions.modality}
          </div>
          <div className="rounded-md bg-gray-50 px-4 py-2.5 text-[13px] font-medium text-gray-700">
            {conditions.contractType}
          </div>
          <div className="rounded-md bg-gray-50 px-4 py-2.5 text-[13px] font-medium text-gray-700">
            {conditions.vacancyCount} {conditions.vacancyCount === "1" ? "vacante" : "vacantes"}
          </div>
          <div className="rounded-md bg-gray-50 px-4 py-2.5 text-[13px] font-medium text-gray-700">
            {conditions.salary}
          </div>
        </div>

        <p className="mb-6 whitespace-pre-line break-words text-[14px] leading-relaxed text-gray-600">
          {formatDescription(conditions.description, isExpanded)}
          {canExpand && (
            <>
              {" "}
              <Button
                type="button"
                variant="link"
                aria-expanded={isExpanded}
                onClick={() => setIsExpanded((current) => !current)}
                className="h-auto p-0 font-semibold text-[#E50000]"
              >
                {isExpanded ? "Ver menos" : "Ver más"}
              </Button>
            </>
          )}
        </p>

        <Separator className="mb-5" />

        <div className="mb-5">
          <h4 className="mb-1 text-[14px] font-semibold text-gray-900">Idiomas</h4>
          <p className="text-[14px] text-gray-600">{conditions.languages}</p>
        </div>

        <Separator className="mb-5" />

        <div className="mb-6">
          <h4 className="mb-1 text-[14px] font-semibold text-gray-900">Ubicación</h4>
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-[14px] text-[#E50000] underline-offset-2 hover:underline"
          >
            {mapsLink}
          </a>
        </div>

        <ul className="flex flex-wrap gap-2" aria-label="Habilidades requeridas">
          {conditions.skills.map((skill) => (
            <li key={skill.id} className="rounded-full bg-gray-100 px-4 py-1.5 text-[13px] font-semibold text-gray-700">
              {skill.name}
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <Alert variant="destructive" className="mx-auto mt-6 max-w-3xl">
          <AlertTitle>{error.message}</AlertTitle>
          {error.details.length > 0 && (
            <AlertDescription>
              <ul className="list-disc pl-5">
                {error.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </AlertDescription>
          )}
        </Alert>
      )}

      <StepActions
        secondaryLabel="Anterior"
        primaryLabel={isSubmitting ? "Publicando..." : "Confirmar publicación"}
        onSecondary={onPrevious}
        onPrimary={onConfirm}
        isBusy={isSubmitting}
        className="mx-auto mt-8 max-w-3xl"
      />

      <ConfirmDialog
        isOpen={isPublished}
        title={PUBLISHED_DIALOG_TEXT.title}
        description={PUBLISHED_DIALOG_TEXT.description}
        confirmLabel={PUBLISHED_DIALOG_TEXT.confirm}
        onConfirm={onFinish}
      />
    </div>
  );
}
