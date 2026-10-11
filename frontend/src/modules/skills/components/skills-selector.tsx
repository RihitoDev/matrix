"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { LoaderCircle, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { SKILLS_UI_TEXTS } from "../constants/skills.constants";
import type { SkillsSelectorProps } from "../types/skills-selector-props.types";
import { getFieldErrorProps } from "@/modules/profile/utils/get-field-error-props";
import { validateCustomSkill } from "../utils/validate-custom-skill";
import { FeedbackMessage } from "@/modules/profile/components/feedback-message";
import { FormField } from "@/modules/profile/components/form-field";
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

    const error = validateCustomSkill(customSkillName, [
      ...(catalogSkills ?? []),
      ...(selectedSkills ?? []),
    ]);
    if (error) {
      setCustomSkillError(error);
      return;
    }

    onCreateCustomSkill((customSkillName ?? "").trim());
    setCustomSkillName("");
    setCustomSkillError("");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-[15px] font-semibold text-ink">{SKILLS_UI_TEXTS.mySkillsTitle}</h3>
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
      </div>

      <div className="flex flex-col gap-3">
        <FormField id="skills-search" label={SKILLS_UI_TEXTS.searchLabel}>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-text-secondary"
            />
            <Input
              id="skills-search"
              type="text"
              placeholder={SKILLS_UI_TEXTS.searchPlaceholder}
              value={searchTerm}
              disabled={isMutateDisabled}
              onChange={(event) => setSearchTerm(event.target.value)}
              className={cn("w-full rounded-lg border border-border bg-surface px-4 text-[15px] text-ink placeholder:text-text-secondary/70 focus:border-ink-soft focus:ring-2 focus:ring-ink/10 focus:outline-none disabled:opacity-60 aria-invalid:border-accent aria-invalid:focus:ring-accent/15 h-12 md:text-[15px] focus-visible:border-ink-soft focus-visible:ring-2 focus-visible:ring-ink/10 aria-invalid:ring-0", "pl-11")}
            />
          </div>
        </FormField>

        <ul className="max-h-64 divide-y divide-border overflow-y-auto">
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

      <form noValidate onSubmit={handleCreateCustomSkill}>
        <FormField
          id="custom-skill"
          label={SKILLS_UI_TEXTS.customSkillLabel}
          error={customSkillError}
        >
          <div className="flex gap-3">
            <Input
              id="custom-skill"
              type="text"
              placeholder={SKILLS_UI_TEXTS.customSkillPlaceholder}
              value={customSkillName}
              disabled={isMutateDisabled}
              onChange={(event) => {
                setCustomSkillName(event.target.value);
                setCustomSkillError("");
              }}
              className="w-full rounded-lg border border-border bg-surface px-4 text-[15px] text-ink placeholder:text-text-secondary/70 focus:border-ink-soft focus:ring-2 focus:ring-ink/10 focus:outline-none disabled:opacity-60 aria-invalid:border-accent aria-invalid:focus:ring-accent/15 h-12 md:text-[15px] focus-visible:border-ink-soft focus-visible:ring-2 focus-visible:ring-ink/10 aria-invalid:ring-0"
              {...getFieldErrorProps("custom-skill", customSkillError)}
            />
            <Button
              type="submit"
              variant="outline"
              disabled={isMutateDisabled}
              className="h-12 border-border-strong bg-surface px-6 text-[14px] font-semibold text-ink hover:bg-surface-soft disabled:opacity-60"
            >
              {SKILLS_UI_TEXTS.addButton}
            </Button>
          </div>
        </FormField>
      </form>

      <div className="flex flex-col gap-4">
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
          className={cn("h-12 bg-accent px-6 text-[14px] font-semibold text-white hover:bg-danger", "w-full")}
        >
          {isSaving ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}
          {isSaving ? SKILLS_UI_TEXTS.savingButton : SKILLS_UI_TEXTS.saveButton}
        </Button>
      </div>
    </div>
  );
}
