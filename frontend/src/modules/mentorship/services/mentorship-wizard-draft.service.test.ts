import { afterEach, describe, expect, it, vi } from "vitest";
import { MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY } from "../constants/mentorship-wizard.constants";
import type { MentorshipWizardState } from "../types/mentorship-wizard-state.types";
import {
  clearMentorshipWizardDraft,
  loadMentorshipWizardDraft,
  saveMentorshipWizardDraft,
} from "./mentorship-wizard-draft.service";

const validDraft: MentorshipWizardState = {
  currentStep: 3,
  wantsToParticipate: true,
  selectedTechnicalAreaIds: ["area-id"],
  selectedOrientationTypeIds: ["orientation-id"],
};

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("mentorship wizard draft", () => {
  it("returns null when no draft exists", () => {
    expect(loadMentorshipWizardDraft()).toBeNull();
  });

  it.each(["{broken", "", "null", "[]", '"text"', "42", "{}", '{"currentStep":2}'])(
    "removes corrupt or incompatible JSON: %s",
    (stored) => {
      localStorage.setItem(MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY, stored);
      expect(loadMentorshipWizardDraft()).toBeNull();
      expect(localStorage.getItem(MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY)).toBeNull();
    },
  );

  it.each([
    { currentStep: 0 },
    { currentStep: 5 },
    { currentStep: 1.5 },
    { currentStep: "2" },
    { wantsToParticipate: "true" },
    { selectedTechnicalAreaIds: "area-id" },
    { selectedTechnicalAreaIds: [1] },
    { selectedOrientationTypeIds: null },
    { selectedOrientationTypeIds: [false] },
  ])("removes drafts with invalid fields: %j", (changes) => {
    localStorage.setItem(
      MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY,
      JSON.stringify({ ...validDraft, ...changes }),
    );
    expect(loadMentorshipWizardDraft()).toBeNull();
    expect(localStorage.getItem(MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it.each([1, 2, 3, 4] as const)("preserves a valid draft at step %i", (currentStep) => {
    const draft = { ...validDraft, currentStep };
    saveMentorshipWizardDraft(draft);
    expect(loadMentorshipWizardDraft()).toEqual(draft);
    expect(localStorage.getItem(MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY)).not.toBeNull();
  });

  it("accepts an incomplete selection as a valid draft", () => {
    const draft = { ...validDraft, wantsToParticipate: false, selectedTechnicalAreaIds: [], selectedOrientationTypeIds: [] };
    saveMentorshipWizardDraft(draft);
    expect(loadMentorshipWizardDraft()).toEqual(draft);
  });

  it("clears a saved draft", () => {
    saveMentorshipWizardDraft(validDraft);
    clearMentorshipWizardDraft();
    expect(loadMentorshipWizardDraft()).toBeNull();
  });

  it("does not access storage outside the browser", () => {
    vi.stubGlobal("window", undefined);
    expect(loadMentorshipWizardDraft()).toBeNull();
    expect(() => saveMentorshipWizardDraft(validDraft)).not.toThrow();
    expect(() => clearMentorshipWizardDraft()).not.toThrow();
  });
});
