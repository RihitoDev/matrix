"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import {
  MAX_DESCRIPTION_CHARS,
  MAX_SKILLS,
  SKILLS_CATALOG_MESSAGES,
  VACANCY_MESSAGES,
} from "../constants/vacancies.constants";
import { useSkillsCatalog } from "../hooks/use-skills-catalog";
import type {
  SkillOption,
  UpdateVacancyField,
  VacancyConditions,
  VacancyErrors,
} from "../types/vacancy-conditions.types";
import { FieldError } from "./field-error";
import { SkillSearchDialog } from "./skill-search-dialog";
import { StepActions } from "./step-actions";

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
  const catalog = useSkillsCatalog();
  const isSkillLimitReached = conditions.skills.length >= MAX_SKILLS;

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateField("description", event.target.value.slice(0, MAX_DESCRIPTION_CHARS));
  };

  const isSelected = (skill: SkillOption) => conditions.skills.some((item) => item.id === skill.id);

  const toggleSkill = (skill: SkillOption) => {
    if (isSelected(skill)) {
      updateField("skills", conditions.skills.filter((item) => item.id !== skill.id));
      return;
    }
    if (isSkillLimitReached) return;
    updateField("skills", [...conditions.skills, skill]);
  };

  const addSkill = (skill: SkillOption) => {
    if (isSelected(skill) || isSkillLimitReached) return;
    updateField("skills", [...conditions.skills, skill]);
  };

  return (
    <div className="mt-6 rounded-xl border border-border bg-surface">
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <h2 className="text-[16px] font-bold text-ink">Requisitos técnicos</h2>
        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
          Chips Seleccionables
        </span>
      </div>

      <div className="px-6 py-6">
        <div className="mb-8">
          <Label htmlFor="description" className="mb-2 text-[12.5px] font-semibold text-ink">
            Descripcion del puesto <span className="text-danger">*</span>
          </Label>
          <Textarea
            id="description"
            value={conditions.description}
            onChange={handleDescriptionChange}
            maxLength={MAX_DESCRIPTION_CHARS}
            placeholder="Buscamos un desarrollador backend..."
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? "description-error" : undefined}
            className="min-h-[120px] whitespace-pre-wrap bg-white p-4 text-[14px] text-ink"
          />
          <div className="mt-1 flex justify-end">
            <span
              className={`text-[11px] font-medium ${conditions.description.length >= MAX_DESCRIPTION_CHARS ? "text-danger" : "text-slate-400"}`}
            >
              {conditions.description.length}/{MAX_DESCRIPTION_CHARS}
            </span>
          </div>
          <FieldError fieldId="description" message={errors.description} />
        </div>

        <div id="skills" tabIndex={-1}>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-4 w-4 items-center justify-center rounded-full border border-amber-500 text-[10px] font-bold text-amber-500">
              i
            </div>
            <p className="text-[13px] text-text-secondary">
              Selecciona las habilidades requeridas para facilitar el procesamiento de la oferta.
            </p>
          </div>

          {catalog.status === "loading" && (
            <p className="text-[13px] text-text-secondary">{SKILLS_CATALOG_MESSAGES.loading}</p>
          )}

          {catalog.status === "error" && (
            <div role="alert" className="flex items-center gap-3 text-[13px] text-danger">
              <span>{SKILLS_CATALOG_MESSAGES.error}</span>
              <Button type="button" variant="outline" size="sm" onClick={catalog.reload}>
                {SKILLS_CATALOG_MESSAGES.retry}
              </Button>
            </div>
          )}

          {catalog.status === "ready" && (
            <div className="flex flex-wrap gap-2.5">
              {catalog.skills.map((skill) => {
                const selected = isSelected(skill);
                return (
                  <Toggle
                    key={skill.id}
                    variant="outline"
                    pressed={selected}
                    disabled={!selected && isSkillLimitReached}
                    onPressedChange={() => toggleSkill(skill)}
                    className="h-auto rounded-full px-4 py-1.5 text-[13px] font-medium text-text-secondary data-[pressed]:border-ink data-[pressed]:bg-ink data-[pressed]:text-white"
                  >
                    {skill.name}
                  </Toggle>
                );
              })}
              <SkillSearchDialog
                catalog={catalog.skills}
                selected={conditions.skills}
                isDisabled={isSkillLimitReached}
                onAdd={addSkill}
              />
            </div>
          )}

          {isSkillLimitReached && (
            <p className="mt-3 text-[12px] font-medium text-text-secondary">{VACANCY_MESSAGES.skillsLimit}</p>
          )}
          <FieldError fieldId="skills" message={errors.skills} />
        </div>
      </div>

      <StepActions
        secondaryLabel="Anterior"
        primaryLabel="Continuar"
        onSecondary={onPrevious}
        onPrimary={onContinue}
      />
    </div>
  );
}
