"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PENDING_SKILL_ID_PREFIX,
  SKILLS_ERROR_MESSAGES,
  SKILLS_SUCCESS_MESSAGES,
} from "../constants/skills.constants";
import { skillsService } from "../services/skills.service";
import type { Feedback } from "@/modules/profile/types/feedback.types";
import type { SkillItem } from "../types/skill-item.types";
import type { UseSkillsResult } from "../types/use-skills-result.types";
import { getSkillsErrorMessage } from "../utils/get-skills-error-message";

function resolveSkill(skill: SkillItem): Promise<SkillItem> {
  if (skill.id.startsWith(PENDING_SKILL_ID_PREFIX)) {
    return skillsService.createCustomSkill(skill.name);
  }

  return Promise.resolve(skill);
}

interface SkillsFetchResult {
  catalog: SkillItem[] | null;
  mySkills: SkillItem[] | null;
  error: unknown | null;
}

async function fetchSkills(): Promise<SkillsFetchResult> {
  try {
    const [catalog, mySkills] = await Promise.all([
      skillsService.getCatalog(),
      skillsService.getMySkills(),
    ]);
    return { catalog, mySkills, error: null };
  } catch (error) {
    return { catalog: null, mySkills: null, error };
  }
}

export function useSkills(): UseSkillsResult {
  const [catalogSkills, setCatalogSkills] = useState<SkillItem[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<SkillItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const applyFetchResult = useCallback((result: SkillsFetchResult) => {
    if (result.error !== null) {
      setHasLoadError(true);
      setFeedback({
        type: "error",
        message: getSkillsErrorMessage(result.error, SKILLS_ERROR_MESSAGES.load),
      });
    } else {
      setCatalogSkills(result.catalog ?? []);
      setSelectedSkills(result.mySkills ?? []);
      setHasLoadError(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let isActive = true;

    void fetchSkills().then((result) => {
      if (isActive) {
        applyFetchResult(result);
      }
    });

    return () => {
      isActive = false;
    };
  }, [applyFetchResult]);

  const reload = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    const result = await fetchSkills();
    applyFetchResult(result);
  }, [applyFetchResult]);

  function addSkill(skill: SkillItem): void {
    if (hasLoadError || isSaving) {
      return;
    }
    setSelectedSkills((current = []) =>
      (current ?? []).some((selected) => selected.id === skill.id) ? current : [...current, skill],
    );
    setFeedback(null);
  }

  function removeSkill(skillId: string): void {
    if (hasLoadError || isSaving) {
      return;
    }
    setSelectedSkills((current = []) => (current ?? []).filter((skill) => skill.id !== skillId));
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

    setIsSaving(true);
    setFeedback(null);

    try {
      const resolvedSkills = await Promise.all((selectedSkills ?? []).map(resolveSkill));
      const skillIds = [...new Set((resolvedSkills ?? []).map((skill) => skill.id))];
      const savedSkills = await skillsService.saveMySkills(skillIds);
      setSelectedSkills(savedSkills ?? []);
      setFeedback({ type: "success", message: SKILLS_SUCCESS_MESSAGES.saved });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getSkillsErrorMessage(error, SKILLS_ERROR_MESSAGES.save),
      });
    } finally {
      setIsSaving(false);
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
