"use client";

import { useCallback, useEffect, useState } from "react";
import { INITIAL_MENTORSHIP_WIZARD_STATE } from "../constants/mentorship-wizard.constants";
import {
  loadMentorshipWizardDraft,
  saveMentorshipWizardDraft,
} from "../services/mentorship-wizard-draft.service";
import type { MentorshipStep } from "../types/mentorship-step.types";
import type { MentorshipWizardState } from "../types/mentorship-wizard-state.types";

export function useMentorshipWizard() {
  const [state, setState] = useState<MentorshipWizardState>(
    INITIAL_MENTORSHIP_WIZARD_STATE,
  );
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    queueMicrotask(() => {
      if (!isMounted) {
        return;
      }

      const draft = loadMentorshipWizardDraft();

      if (draft) {
        setState(draft);
      }

      setIsDraftHydrated(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isDraftHydrated) {
      return;
    }

    saveMentorshipWizardDraft(state);
  }, [isDraftHydrated, state]);

  const goToStep = useCallback((step: MentorshipStep) => {
    setState((prev) => ({
      ...prev,
      currentStep: step,
    }));
  }, []);

  const goNext = useCallback(() => {
    setState((prev) => {
      if (prev.currentStep >= 4) return prev;

      return {
        ...prev,
        currentStep: (prev.currentStep + 1) as MentorshipStep,
      };
    });
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.currentStep <= 1) return prev;

      return {
        ...prev,
        currentStep: (prev.currentStep - 1) as MentorshipStep,
      };
    });
  }, []);

  const toggleTechnicalArea = useCallback((id: string) => {
    setState((prev) => {
      const alreadySelected =
        prev.selectedTechnicalAreaIds.includes(id);

      const selectedTechnicalAreaIds = alreadySelected
        ? prev.selectedTechnicalAreaIds.filter(
            (areaId) => areaId !== id,
          )
        : [...prev.selectedTechnicalAreaIds, id];

      return {
        ...prev,
        selectedTechnicalAreaIds,
      };
    });
  }, []);

  const canGoNextFromStep2 =
    state.selectedTechnicalAreaIds.length > 0;

  const canGoNextFromStep3 =
    state.selectedOrientationTypeIds.length > 0;

  return {
    ...state,
    goToStep,
    goNext,
    goBack,
    toggleTechnicalArea,
    canGoBack: state.currentStep > 1,
    canGoNext:
      state.currentStep === 2
        ? canGoNextFromStep2
        : state.currentStep === 3
          ? canGoNextFromStep3
          : state.currentStep < 4,
    setState,
  };
}
