"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  PENDING_SKILL_ID_PREFIX,
  SKILLS_ERROR_MESSAGES,
  SKILLS_SUCCESS_MESSAGES,
} from "../constants/skills.constants";
import { skillsService } from "../services/skills.service";
import type { Feedback } from "@/modules/profile";
import type { SkillItem } from "../types/skill-item.types";
import type { UseSkillsResult } from "../types/use-skills-result.types";
import { getSkillsErrorMessage } from "../utils/get-skills-error-message";

function resolveSkill(skill: SkillItem): Promise<SkillItem> {
  if (skill.id.startsWith(PENDING_SKILL_ID_PREFIX)) {
    return skillsService.createCustomSkill(skill.name);
  }

  return Promise.resolve(skill);
}

export function useSkills(): UseSkillsResult {
  const query = useQuery({
    queryKey: ["skills", "profile"],
    queryFn: async () => {
      const [catalog, selected] = await Promise.all([skillsService.getCatalog(), skillsService.getMySkills()]);
      return { catalog, selected };
    },
  });
  const [draftSkills, setSelectedSkills] = useState<SkillItem[] | null>(null);
  const selectedSkills = draftSkills ?? query.data?.selected ?? [];
  const catalogSkills = query.data?.catalog ?? [];
  const isLoading = query.isFetching;
  const hasLoadError = query.isError;
  const [localFeedback, setFeedback] = useState<Feedback | null>(null);
  const feedback = query.error ? { type: "error" as const, message: getSkillsErrorMessage(query.error, SKILLS_ERROR_MESSAGES.load) } : localFeedback;
  const mutation = useMutation({ mutationFn: async (selection: SkillItem[]) => {
    const resolvedSkills = await Promise.all(selection.map(resolveSkill));
    const skillIds = [...new Set(resolvedSkills.map(({ id }) => id))];
    return skillsService.saveMySkills(skillIds);
  } });
  const isSaving = mutation.isPending;
  async function reload(): Promise<void> {
    setSelectedSkills(null);
    setFeedback(null);
    await query.refetch();
  }

  function addSkill(skill: SkillItem): void {
    if (hasLoadError || isSaving) {
      return;
    }
    setSelectedSkills((current = []) =>
      (current ?? selectedSkills).some((selected) => selected.id === skill.id) ? current : [...(current ?? selectedSkills), skill],
    );
    setFeedback(null);
  }

  function removeSkill(skillId: string): void {
    if (hasLoadError || isSaving) {
      return;
    }
    setSelectedSkills((current = []) => (current ?? selectedSkills).filter((skill) => skill.id !== skillId));
    setFeedback(null);
  }

  function createCustomSkill(name: string): void {
    if (hasLoadError || isSaving) {
      return;
    }
    const trimmedName = (name ?? "").trim();
    if (!trimmedName) {
      return;
    }
    addSkill({ id: `${PENDING_SKILL_ID_PREFIX}${trimmedName.toLowerCase()}`, name: trimmedName });
  }

  async function saveSkills(): Promise<void> {
    if (hasLoadError || isLoading || isSaving) {
      return;
    }

    setFeedback(null);

    try {
      const savedSkills = await mutation.mutateAsync(selectedSkills ?? []);
      setSelectedSkills(savedSkills ?? []);
      setFeedback({ type: "success", message: SKILLS_SUCCESS_MESSAGES.saved });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getSkillsErrorMessage(error, SKILLS_ERROR_MESSAGES.save),
      });

    }
  }

  return {
    catalogSkills,
    selectedSkills,
    isLoading,
    isSaving,
    hasLoadError,
    feedback,
    addSkill,
    removeSkill,
    createCustomSkill,
    saveSkills,
    reload,
  };
}
