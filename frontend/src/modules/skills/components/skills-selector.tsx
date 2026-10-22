"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { CUSTOM_SKILL_HINT, CUSTOM_SKILL_HINT_ID, SKILL_NAME_MAX_LENGTH, SKILLS_UI_TEXTS } from "../constants/skills.constants";
import type { SkillsSelectorProps } from "../types/skills-selector-props.types";
import { getFieldErrorId, getFieldErrorProps } from "@/modules/profile";
import { formatSkillName } from "../utils/format-skill-name";
import { validateCustomSkill } from "../utils/validate-custom-skill";
import { FeedbackMessage } from "@/modules/profile";
import { FormField } from "@/modules/profile";
import { SectionCard } from "@/modules/profile";
import { SkillBadge } from "./skill-badge";

export function SkillsSelector({
  catalogSkills = [],
  selectedSkills = [],
  onAddSkill,
  onRemoveSkill,
  onCreateCustomSkill,
  onSave,
  isSaving = false,
  hasLoadError = false,
  onRetry,
  feedback = null,
}: SkillsSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [customSkillName, setCustomSkillName] = useState("");
  const [customSkillError, setCustomSkillError] = useState("");

  const isMutateDisabled = isSaving || hasLoadError;

  const selectedIds = useMemo(
    () => new Set((selectedSkills ?? []).map((skill) => skill.id)),
    [selectedSkills],
  );

  const filteredCatalog = useMemo(() => {
    const normalizedTerm = (searchTerm ?? "").trim().toLowerCase();
    if (!normalizedTerm) return catalogSkills ?? [];
    return (catalogSkills ?? []).filter((skill) =>
      (skill?.name ?? "").toLowerCase().includes(normalizedTerm),
    );
  }, [catalogSkills, searchTerm]);

  const handleCreateCustomSkill = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isMutateDisabled) return;

    const formattedName = formatSkillName(customSkillName);
    const error = validateCustomSkill(formattedName, [
      ...(catalogSkills ?? []),
      ...(selectedSkills ?? []),
    ]);
    if (error) {
      setCustomSkillError(error);
      return;
    }

    onCreateCustomSkill(formattedName);
    setCustomSkillName("");
    setCustomSkillError("");
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <SectionCard title={SKILLS_UI_TEXTS.searchCardTitle}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            <FormField id="skills-search" label={SKILLS_UI_TEXTS.searchLabel}>
              <Input
                id="skills-search"
                type="text"
                placeholder={SKILLS_UI_TEXTS.searchPlaceholder}
                value={searchTerm}
                disabled={isMutateDisabled}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-11"
              />
            </FormField>

            <div className="flex flex-col gap-1">
              <h4 className="text-[11.5px] font-semibold tracking-wide text-text-secondary uppercase">
                {SKILLS_UI_TEXTS.suggestionsTitle}
              </h4>
              <ul className="max-h-96 divide-y divide-border overflow-y-auto">
                {(filteredCatalog ?? []).length === 0 ? (
                  <li className="py-3 text-[13px] text-text-secondary">{SKILLS_UI_TEXTS.emptyCatalog}</li>
                ) : (
                  (filteredCatalog ?? []).map((skill) => {
                    const isSelected = selectedIds.has(skill.id);

                    return (
                      <li key={skill.id} className="flex items-center justify-between gap-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-[15px] font-semibold text-ink">{skill.name}</span>
                          {skill.category ? (
                            <span className="text-[13px] text-text-secondary">{skill.category}</span>
                          ) : null}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isSelected || isMutateDisabled}
                          onClick={() => onAddSkill(skill)}
                          className="gap-1 text-[13px] font-semibold text-ink hover:bg-transparent hover:text-accent disabled:text-text-secondary"
                        >
                          <Plus aria-hidden="true" className="size-3.5" />
                          {isSelected ? SKILLS_UI_TEXTS.addedCatalogButton : SKILLS_UI_TEXTS.addCatalogButton}
                        </Button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </div>

          <form noValidate onSubmit={handleCreateCustomSkill} className="border-t border-border pt-6">
            <FormField
              id="custom-skill"
              label={SKILLS_UI_TEXTS.customSkillLabel}
              error={customSkillError}
            >
              <p className="text-[13px] text-text-secondary">{SKILLS_UI_TEXTS.customSkillDescription}</p>
              <div className="flex gap-3">
                <Input
                  id="custom-skill"
                  type="text"
                  value={customSkillName}
                  maxLength={SKILL_NAME_MAX_LENGTH}
                  disabled={isMutateDisabled}
                  onChange={(event) => {
                    setCustomSkillName(event.target.value);
                    setCustomSkillError("");
                  }}
                  className="h-11"
                  {...getFieldErrorProps("custom-skill", customSkillError)}
                  aria-describedby={[CUSTOM_SKILL_HINT_ID, customSkillError ? getFieldErrorId("custom-skill") : null]
                    .filter(Boolean)
                    .join(" ")}
                />
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isMutateDisabled}
                  className="h-12 gap-1 border-border-strong bg-surface px-6 text-[14px] font-semibold text-ink hover:bg-surface-soft disabled:opacity-60"
                >
                  <Plus aria-hidden="true" className="size-4" />
                  {SKILLS_UI_TEXTS.addButton}
                </Button>
              </div>
              <p id={CUSTOM_SKILL_HINT_ID} className="text-[13px] text-text-secondary">
                {CUSTOM_SKILL_HINT}
              </p>
            </FormField>
          </form>
        </div>
      </SectionCard>

      <SectionCard
        title={SKILLS_UI_TEXTS.mySkillsTitle}
        description={SKILLS_UI_TEXTS.mySkillsDescription}
        contentClassName="flex flex-1 flex-col gap-6"
      >
        {(selectedSkills ?? []).length === 0 ? (
          <p className="text-[13px] text-text-secondary">{SKILLS_UI_TEXTS.emptySelected}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(selectedSkills ?? []).map((skill) => (
              <SkillBadge
                key={skill.id}
                skill={skill}
                onRemove={onRemoveSkill}
                disabled={isMutateDisabled}
              />
            ))}
          </div>
        )}

        <p className="text-[13px] text-text-secondary">{SKILLS_UI_TEXTS.mySkillsNote}</p>

        <div className="mt-auto flex flex-col gap-4">
          {feedback ? <FeedbackMessage feedback={feedback} /> : null}
          {hasLoadError && onRetry ? (
            <Button
              type="button"
              variant="outline"
              onClick={onRetry}
              className="h-10 w-full border-border-strong bg-surface text-[14px] font-semibold text-ink hover:bg-surface-soft"
            >
              {SKILLS_UI_TEXTS.retryButton}
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving || hasLoadError}
            className={cn("h-10 bg-accent px-4 text-sm text-white hover:bg-brand-hover", "w-full")}
          >
            {isSaving ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}
            {isSaving ? SKILLS_UI_TEXTS.savingButton : SKILLS_UI_TEXTS.saveButton}
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
