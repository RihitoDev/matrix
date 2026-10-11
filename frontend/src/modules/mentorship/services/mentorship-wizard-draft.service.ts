import { MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY } from "../constants/mentorship-wizard.constants";
import type { MentorshipWizardState } from "../types/mentorship-wizard-state.types";

function isMentorshipWizardState(value: unknown): value is MentorshipWizardState {
  if (typeof value !== "object" || value === null) return false;

  const draft = value as Record<string, unknown>;
  return (
    (draft.currentStep === 1 ||
      draft.currentStep === 2 ||
      draft.currentStep === 3 ||
      draft.currentStep === 4) &&
    typeof draft.wantsToParticipate === "boolean" &&
    Array.isArray(draft.selectedTechnicalAreaIds) &&
    draft.selectedTechnicalAreaIds.every((id) => typeof id === "string") &&
    Array.isArray(draft.selectedOrientationTypeIds) &&
    draft.selectedOrientationTypeIds.every((id) => typeof id === "string")
  );
}

export function saveMentorshipWizardDraft(
  state: MentorshipWizardState,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY,
    JSON.stringify(state),
  );
}

export function loadMentorshipWizardDraft(): MentorshipWizardState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(
    MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY,
  );

  if (stored === null) {
    return null;
  }

  try {
    const draft: unknown = JSON.parse(stored);
    if (isMentorshipWizardState(draft)) return draft;
  } catch {
    window.localStorage.removeItem(MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY);
    return null;
  }

  window.localStorage.removeItem(MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY);
  return null;
}

export function clearMentorshipWizardDraft(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY);
}
