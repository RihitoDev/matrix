"use client";

import { useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import type { SkillItem } from "@/modules/skills/types/skill-item.types";
import {
  MAX_DESCRIPTION_CHARS,
  MAX_SKILLS,
  SKILLS_CATALOG_MESSAGES,
  VACANCY_MESSAGES,
} from "../constants/vacancies.constants";
import { useSkillsCatalog } from "../hooks/use-skills-catalog";
import type { UpdateVacancyField, VacancyConditions, VacancyErrors } from "../hooks/use-job-offer-form";
import { FieldError } from "./field-error";

interface RequirementsStepProps {
  conditions: VacancyConditions;
  errors: VacancyErrors;
  updateField: UpdateVacancyField;
  onPrevious: () => void;
  onContinue: () => void;
}

export function RequirementsStep({
  conditions,
  errors,
  updateField,
  onPrevious,
  onContinue,
}: RequirementsStepProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const catalog = useSkillsCatalog();

  const hasUnsavedChanges = conditions.description !== "" || conditions.skills.length > 0;
  const isSkillLimitReached = conditions.skills.length >= MAX_SKILLS;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_DESCRIPTION_CHARS) {
       updateField("description", text);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [conditions.description]);

  const isSelected = (skill: SkillItem) => conditions.skills.some((item) => item.id === skill.id);

  const toggleSkill = (skill: SkillItem) => {
    if (isSelected(skill)) {
      updateField("skills", conditions.skills.filter((item) => item.id !== skill.id));
      return;
    }
    if (isSkillLimitReached) return;
    updateField("skills", [...conditions.skills, skill]);
  };

  return (
    <div className="mt-6 rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-6 py-4 flex items-center gap-3">
         <h2 className="text-[16px] font-bold text-ink">Requisitos técnicos</h2>
         <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            Chips Seleccionables
         </span>
      </div>

      <div className="px-6 py-6">
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <Label htmlFor="description" className="text-[12.5px] font-semibold text-ink">
              Descripcion del puesto <span className="text-danger">*</span>
            </Label>
          </div>

          <div className="relative border border-border rounded-lg focus-within:border-ink focus-within:ring-1 focus-within:ring-ink bg-white overflow-hidden">
             <textarea
                id="description"
                ref={textareaRef}
                value={conditions.description}
                onChange={handleDescriptionChange}
                placeholder="Buscamos un desarrollador backend..."
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? "description-error" : undefined}
                className="w-full min-h-[120px] p-4 text-[14px] text-ink outline-none resize-none whitespace-pre-wrap bg-transparent"
             />
             <div className="flex justify-end p-2 bg-white">
                <span className={`text-[11px] font-medium ${conditions.description.length >= MAX_DESCRIPTION_CHARS ? 'text-danger' : 'text-slate-400'}`}>
                  {conditions.description.length}/{MAX_DESCRIPTION_CHARS}
                </span>
             </div>
          </div>
          <FieldError fieldId="description" message={errors.description} />
        </div>

        <div id="skills" tabIndex={-1}>
           <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 rounded-full border border-amber-500 flex items-center justify-center text-amber-500 text-[10px] font-bold">i</div>
              <p className="text-[13px] text-text-secondary">Selecciona las habilidades requeridas para facilitar el procesamiento de la oferta.</p>
           </div>

           {catalog.status === "loading" && (
              <p className="text-[13px] text-text-secondary">{SKILLS_CATALOG_MESSAGES.loading}</p>
           )}

           {catalog.status === "error" && (
              <div role="alert" className="flex items-center gap-3 text-[13px] text-danger">
                 <span>{SKILLS_CATALOG_MESSAGES.error}</span>
                 <button
                    type="button"
                    onClick={catalog.reload}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-[12px] font-semibold text-gray-700 hover:bg-gray-50"
                 >
                    {SKILLS_CATALOG_MESSAGES.retry}
                 </button>
              </div>
           )}

           {catalog.status === "ready" && (
              <div className="flex flex-wrap gap-2.5">
                 {catalog.skills.map((skill) => {
                    const selected = isSelected(skill);
                    return (
                       <button
                          key={skill.id}
                          type="button"
                          aria-pressed={selected}
                          disabled={!selected && isSkillLimitReached}
                          onClick={() => toggleSkill(skill)}
                          className={`
                             px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors border
                             disabled:cursor-not-allowed disabled:opacity-50
                             ${selected
                                ? 'bg-ink text-white border-ink'
                                : 'bg-white text-text-secondary border-border hover:border-slate-300'}
                          `}
                       >
                          {skill.name}
                       </button>
                    );
                 })}

                 <button
                    type="button"
                    disabled={isSkillLimitReached}
                    className="px-4 py-1.5 rounded-full text-[13px] font-medium border border-dashed border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                 >
                    + Añadir habilidad
                 </button>
              </div>
           )}

           {isSkillLimitReached && (
              <p className="mt-3 text-[12px] font-medium text-text-secondary">{VACANCY_MESSAGES.skillsLimit}</p>
           )}
           <FieldError fieldId="skills" message={errors.skills} />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border px-6 py-4">
        <button
          type="button"
          onClick={onPrevious}
          className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-lg bg-[#E50000] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
