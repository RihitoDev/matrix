"use client";

import { useState } from "react";
import { WORK_EXPERIENCE_FEEDBACK_MESSAGES } from "../config/work-experience-feedback.config";
import { workExperienceService } from "../services/work-experience.service";
import type { Feedback } from "@/modules/profile/types/feedback.types";
import type { WorkExperiencePayload } from "../types/work-experience-payload.types";
import { skillsAnalysisService } from "@/modules/matching/services/skills-analysis.service";
import type { SkillsAnalysisResult } from "@/modules/matching/types/skills-analysis.types";

export function useSaveWorkExperience(onSaved: () => void) {
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [analysis, setAnalysis] = useState<SkillsAnalysisResult | null>(null);

  async function save(payload: WorkExperiencePayload, id?: string): Promise<void> {
    setIsSaving(true);
    setFeedback(null);
    try {
      const saved = id
        ? await workExperienceService.updateWorkExperience(id, payload)
        : await workExperienceService.createWorkExperience(payload);

      setFeedback({
        type: "success",
        message: id
          ? WORK_EXPERIENCE_FEEDBACK_MESSAGES.updateSuccess
          : WORK_EXPERIENCE_FEEDBACK_MESSAGES.createSuccess,
      });

      setAnalysis(null);
      try {
        setAnalysis(await skillsAnalysisService.analyzeExperience(saved.id, payload.description));
      } catch {}

      onSaved();
    } catch {
      setFeedback({
        type: "error",
        message: id
          ? WORK_EXPERIENCE_FEEDBACK_MESSAGES.updateError
          : WORK_EXPERIENCE_FEEDBACK_MESSAGES.createError,
      });
    } finally {
      setIsSaving(false);
    }
  }

  function clearFeedback() {
    setFeedback(null);
  }

  return { save, isSaving, feedback, clearFeedback, analysis };
}
