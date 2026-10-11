import type { MentorshipWizardState } from "../types/mentorship-wizard-state.types";

export const MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY =
  "umssy-mentorship-wizard-draft";

export const INITIAL_MENTORSHIP_WIZARD_STATE: MentorshipWizardState = {
  currentStep: 1,
  wantsToParticipate: false,
  selectedTechnicalAreaIds: [],
  selectedOrientationTypeIds: [],
};
