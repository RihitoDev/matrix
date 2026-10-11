"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DESCRIPTION_PREVIEW_CHARS } from "../constants/vacancies.constants";
import type { VacancyConditions } from "../hooks/use-job-offer-form";
import type { CurrentCompany, PublishError } from "../types/job-offer.types";

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

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isPublished) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isPublished]);

  return (
    <div className="w-full mt-8">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
        VISTA PREVIA DE LA PUBLICACIÓN
      </h3>

      <div className="bg-white rounded-lg shadow-[0_2px_10px_rgb(0,0,0,0.06)] border border-gray-100 border-t-[4px] border-t-[#E50000] p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-[#0f172a] text-white w-[50px] h-[50px] flex items-center justify-center rounded-lg font-bold text-lg tracking-wider">
            {company.initials}
          </div>
          <div>
            <h4 className="font-extrabold text-gray-900 text-[15px] leading-tight">{company.name}</h4>
            <p className="text-[13px] text-gray-500">Empresa verificada</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-[22px] font-extrabold text-gray-900">{conditions.title}</h2>
          <p className="text-amber-500 font-bold text-[13px] mt-1">{conditions.category}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2">
          <div className="bg-gray-50 text-gray-700 px-4 py-2.5 rounded-md text-[13px] font-medium">
            {conditions.modality}
          </div>
          <div className="bg-gray-50 text-gray-700 px-4 py-2.5 rounded-md text-[13px] font-medium">
            {conditions.contractType}
          </div>
          <div className="bg-gray-50 text-gray-700 px-4 py-2.5 rounded-md text-[13px] font-medium">
            {conditions.vacancyCount} {conditions.vacancyCount === "1" ? "vacante" : "vacantes"}
          </div>
          <div className="bg-gray-50 text-gray-700 px-4 py-2.5 rounded-md text-[13px] font-medium">
            {conditions.salary}
          </div>
        </div>

        <p className="text-[14px] text-gray-600 leading-relaxed mb-6 whitespace-pre-line break-words">
          {formatDescription(conditions.description, isExpanded)}
          {canExpand && (
            <>
              {" "}
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => setIsExpanded((current) => !current)}
                className="text-[#E50000] font-semibold"
              >
                {isExpanded ? "Ver menos" : "Ver más"}
              </button>
            </>
          )}
        </p>

        <hr className="border-gray-100 mb-5" />

        <div className="mb-5">
          <h4 className="text-[14px] font-semibold text-gray-900 mb-1">Idiomas</h4>
          <p className="text-[14px] text-gray-600">{conditions.languages}</p>
        </div>

        <hr className="border-gray-100 mb-5" />

        <div className="mb-6">
          <h4 className="text-[14px] font-semibold text-gray-900 mb-1">Ubicación</h4>
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] text-[#E50000] hover:underline underline-offset-2 break-all"
          >
            {mapsLink}
          </a>
        </div>

        <ul className="flex flex-wrap gap-2" aria-label="Habilidades requeridas">
          {conditions.skills.map((skill) => (
            <li
              key={skill.id}
              className="px-4 py-1.5 bg-gray-100 text-gray-700 text-[13px] font-semibold rounded-full"
            >
              {skill.name}
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          <p className="font-semibold">{error.message}</p>
          {error.details.length > 0 && (
            <ul className="mt-1 list-disc pl-5">
              {error.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          Anterior
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="px-6 py-2.5 bg-[#E50000] hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Publicando..." : "Confirmar publicación"}
        </button>
      </div>

      <AlertDialog open={isPublished}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vacante publicada</AlertDialogTitle>
            <AlertDialogDescription>
              Tu vacante se publicó correctamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={onFinish}>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
