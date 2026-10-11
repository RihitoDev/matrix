import type { MentorshipStep } from "./mentorship-step.types";

export interface MentorshipWizardState {
  currentStep: MentorshipStep;
  wantsToParticipate: boolean;
  selectedTechnicalAreaIds: string[];
  selectedOrientationTypeIds: string[];
}
